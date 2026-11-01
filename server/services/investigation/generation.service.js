import { randomUUID } from 'node:crypto';
import Evidence from '../../models/Evidence.js';
import Investigation from '../../models/Investigation.js';
import UserProgress from '../../models/UserProgress.js';
import { generateJson } from '../gemini/client.js';
import { createBlueprintPrompt, blueprintSystemInstruction } from '../../prompts/blueprint.prompt.js';
import { createEvidencePrompt, evidenceSystemInstruction } from '../../prompts/evidence.prompt.js';
import { createEvidenceAuditPrompt, evidenceAuditSystemInstruction } from '../../prompts/evidence-audit.prompt.js';
import { blueprintSchema, evidenceAuditSchema, evidenceBatchSchema, scenarioAnalysisSchema } from '../../validators/investigation.validators.js';
import { createScenarioAnalysisPrompt, analysisSystemInstruction } from '../../prompts/analysis.prompt.js';
import { validateBlueprint, validateEvidence } from './validation.service.js';
import { generateOptionalCaseMedia } from '../media/image-generation.service.js';
import { removeGeneratedMedia } from '../media/storage.service.js';

const MAX_ATTEMPTS = 2;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
let scheduleBackgroundTask = (task) => setImmediate(task);

export function setGenerationScheduler(schedule) {
  scheduleBackgroundTask = schedule;
}

function isRetryable(error) {
  const status = Number(error.status || error.statusCode);
  return RETRYABLE_STATUSES.has(status)
    || error.name === 'APIConnectionTimeoutError'
    || error.name === 'APIConnectionError'
    || !status;
}

function generationFailureMessage(error) {
  const status = error.status || error.statusCode;
  if (status === 400) return 'Gemini rejected the case blueprint format. Please try again after the server update.';
  if (status === 429) return 'Gemini API quota or rate limit reached. Check your Gemini API usage and try again later.';
  if (status === 503) return 'Gemini is temporarily unavailable. Please try again in a few minutes.';
  if (error.name === 'APIConnectionTimeoutError') return 'The server could not reach Gemini before the request timed out. Please try again.';
  return 'We could not build a consistent case. Please start a new investigation.';
}

async function generateValidated({ schema, prompt, systemInstruction, validate, stage, onBeforeValidate }) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const startedAt = Date.now();
    try {
      const raw = await generateJson({ schema, prompt, systemInstruction });
      console.info(`Mystery generation ${stage} response received in ${Math.round((Date.now() - startedAt) / 1000)}s.`);
      await onBeforeValidate?.();
      return validate(raw);
    } catch (error) {
      lastError = error;
      const errorType = error.status || error.statusCode || error.code || error.name || 'unknown_error';
      console.warn(`Mystery generation ${stage} attempt ${attempt} failed after ${Math.round((Date.now() - startedAt) / 1000)}s (${errorType}).`);
      if (attempt === MAX_ATTEMPTS || !isRetryable(error)) break;
      const retryDelayMs = Math.min(1000 * (2 ** (attempt - 1)), 5000);
      console.info(`Retrying mystery generation ${stage} in ${retryDelayMs / 1000}s.`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
  throw lastError || new Error(`Mystery generation ${stage} failed.`);
}

export async function createInvestigation({ userId, scenario, genre, difficulty }) {
  const generationId = randomUUID();
  const investigation = await Investigation.create({
    userId,
    generationId,
    title: 'New investigation',
    scenario,
    genre,
    difficulty,
    status: 'generating',
    generationStatus: 'queued',
  });
  try {
    await UserProgress.create({ userId, investigationId: investigation._id, status: 'active' });
  } catch (error) {
    await Investigation.deleteOne({ _id: investigation._id });
    throw error;
  }
  scheduleBackgroundTask(() => runGeneration(String(investigation._id)).catch((error) => {
    console.error(`Unable to schedule investigation generation (${error.code || error.name || 'generation_error'}).`);
  }));
  return {
    investigationId: String(investigation._id),
    generationId,
    generationStatus: 'queued',
  };
}

async function setStage(id, generationStatus) {
  await Investigation.updateOne({ _id: id, status: 'generating' }, { $set: { generationStatus } });
}

async function runGeneration(id) {
  let generatedMediaUrls = [];
  try {
    const investigation = await Investigation.findById(id);
    if (!investigation || investigation.status !== 'generating') return;
    await setStage(id, 'analyzing');
    const analysis = await generateValidated({
      schema: scenarioAnalysisSchema,
      prompt: createScenarioAnalysisPrompt(investigation.scenario),
      systemInstruction: analysisSystemInstruction,
      validate: (raw) => scenarioAnalysisSchema.parse(raw),
      stage: 'analysis',
    });

    await setStage(id, 'blueprint');

    const blueprint = await generateValidated({
      schema: blueprintSchema,
      prompt: createBlueprintPrompt({ scenario: investigation.scenario, analysis, genre: investigation.genre, difficulty: investigation.difficulty }),
      systemInstruction: blueprintSystemInstruction,
      validate: (raw) => validateBlueprint(raw, investigation.difficulty),
      stage: 'blueprint',
      onBeforeValidate: () => setStage(id, 'validating'),
    });

    await setStage(id, 'evidence');
    const evidence = await generateValidated({
      schema: evidenceBatchSchema,
      prompt: createEvidencePrompt(blueprint),
      systemInstruction: evidenceSystemInstruction,
      validate: async (raw) => {
        const batch = validateEvidence(raw, blueprint);
        const auditRaw = await generateJson({
          schema: evidenceAuditSchema,
          prompt: createEvidenceAuditPrompt(blueprint, batch),
          systemInstruction: evidenceAuditSystemInstruction,
        });
        const audit = evidenceAuditSchema.parse(auditRaw);
        const expectedIds = new Set(blueprint.evidenceOutline.map(({ evidenceId }) => evidenceId));
        const auditedIds = audit.items.map(({ evidenceId }) => evidenceId);
        if (!audit.valid || audit.issues.length || new Set(auditedIds).size !== expectedIds.size || auditedIds.some((itemId) => !expectedIds.has(itemId)) || audit.items.some((item) => !item.alignsWithBlueprint || !item.supportsIntendedClue || item.revealsCulpritEarly)) {
          const error = new Error('Evidence did not pass the consistency audit.'); error.code = 'EVIDENCE_AUDIT_FAILED'; throw error;
        }
        return batch;
      },
      stage: 'evidence',
      onBeforeValidate: () => setStage(id, 'validating'),
    });

    await setStage(id, 'media');

    const mediaByEvidenceId = await generateOptionalCaseMedia(evidence.items);
    generatedMediaUrls = [...mediaByEvidenceId.values()];

    const evidenceDocuments = evidence.items.map((item) => ({
      investigationId: investigation._id,
      mediaUrl: mediaByEvidenceId.get(item.evidenceId) || null,
      mediaStatus: !['image', 'cctv'].includes(item.type) ? 'not_requested' : mediaByEvidenceId.has(item.evidenceId) ? 'ready' : 'placeholder',
      ...item,
    }));
    await Evidence.insertMany(evidenceDocuments, { ordered: true });

    try {
      investigation.title = blueprint.title;
      investigation.description = blueprint.description;
      investigation.incident = {
        summary: blueprint.incident.summary,
        location: blueprint.incident.location,
        occurredAt: new Date(blueprint.incident.occurredAt),
        affectedPerson: blueprint.incident.affectedPerson,
      };
      investigation.suspects = blueprint.suspects;
      investigation.timeline = blueprint.timeline.map((event) => ({ ...event, timestamp: new Date(event.timestamp) }));
      investigation.contradictions = blueprint.contradictions;
      investigation.canonicalSolution = blueprint.canonicalSolution;
      investigation.generationStatus = 'published';
      investigation.status = 'active';
      await investigation.save();
      const published = await Investigation.exists({ _id: investigation._id, status: 'active' });
      if (!published) throw new Error('The investigation was removed before publication completed.');
    } catch (error) {
      await Evidence.deleteMany({ investigationId: investigation._id });
      throw error;
    }
  } catch (error) {
    const errorType = error.status || error.statusCode || error.code || error.name || 'generation_error';
    console.error(`Investigation generation failed for ${id} (${errorType}).`);
    await Investigation.updateOne(
      { _id: id, status: 'generating' },
      { $set: { status: 'failed', generationStatus: 'failed', failureMessage: generationFailureMessage(error) } },
    );
    await Evidence.deleteMany({ investigationId: id });
    await removeGeneratedMedia(generatedMediaUrls);
    await UserProgress.updateOne({ investigationId: id }, { $set: { status: 'active' } });
  }
}

export async function recoverInterruptedGenerations() {
  const interrupted = await Investigation.find({ status: 'generating' }).select('_id').lean();
  if (!interrupted.length) return;
  const ids = interrupted.map(({ _id }) => _id);
  await Investigation.updateMany(
    { _id: { $in: ids }, status: 'generating' },
    { $set: { status: 'failed', generationStatus: 'failed', failureMessage: 'Generation was interrupted. Please start a new investigation.' } },
  );
  await Evidence.deleteMany({ investigationId: { $in: ids } });
}

