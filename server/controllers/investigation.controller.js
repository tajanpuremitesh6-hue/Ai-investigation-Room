import mongoose from 'mongoose';
import DetectiveNote from '../models/DetectiveNote.js';
import Evidence from '../models/Evidence.js';
import Investigation from '../models/Investigation.js';
import UserProgress from '../models/UserProgress.js';
import { removeGeneratedMedia } from '../services/media/storage.service.js';
import { accusationSchema } from '../validators/investigation.validators.js';
import { createInvestigation } from '../services/investigation/generation.service.js';

export async function create(request, response) {
  const data = await createInvestigation({ userId: request.auth.userId, ...request.validatedBody });
  response.status(202).json({ success: true, message: 'Investigation queued for generation.', data });
}

export async function list(request, response) {
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(request.query.limit, 10) || 20));
  const filter = { userId: request.auth.userId };
  const [investigations, total] = await Promise.all([
    Investigation.find(filter).select('-scenario -canonicalSolution').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Investigation.countDocuments(filter),
  ]);
  const progress = await UserProgress.find({ userId: request.auth.userId, investigationId: { $in: investigations.map(({ _id }) => _id) } }).select('investigationId score').lean();
  const scoreByInvestigation = new Map(progress.map((item) => [String(item.investigationId), item.score]));
  const items = investigations.map((item) => ({ ...item, score: scoreByInvestigation.get(String(item._id)) ?? null }));
  response.json({ success: true, message: 'Investigations loaded.', data: { investigations: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
}

export async function getOne(request, response) {
  const investigation = await Investigation.findById(request.investigation._id).select('-canonicalSolution -failureMessage').lean();
  const progress = await UserProgress.findOne({ userId: request.auth.userId, investigationId: request.investigation._id }).lean();
  response.json({ success: true, message: 'Investigation loaded.', data: { investigation, progress } });
}

export async function generationStatus(request, response) {
  const investigation = await Investigation.findById(request.investigation._id).select('generationId status generationStatus failureMessage').lean();
  response.json({
    success: true,
    message: 'Generation status loaded.',
    data: {
      investigationId: String(investigation._id),
      generationId: investigation.generationId,
      status: investigation.status,
      generationStatus: investigation.generationStatus,
      ...(investigation.failureMessage ? { message: investigation.failureMessage } : {}),
    },
  });
}

export async function remove(request, response) {
  const investigationId = request.investigation._id;
  const media = await Evidence.find({ investigationId }).select('mediaUrl').lean();
  await Promise.all([
    Evidence.deleteMany({ investigationId }),
    UserProgress.deleteMany({ investigationId }),
    DetectiveNote.deleteMany({ investigationId }),
    Investigation.deleteOne({ _id: investigationId, userId: request.auth.userId }),
  ]);
  await removeGeneratedMedia(media.map(({ mediaUrl }) => mediaUrl));
  response.json({ success: true, message: 'Investigation deleted.', data: { deleted: true } });
}

export async function accuse(request, response) {
  const { selectedSuspectId, reasoning } = request.validatedBody;
  const investigation = await Investigation.findOne({ _id: request.investigation._id, userId: request.auth.userId }).select('+canonicalSolution');
  if (!investigation || investigation.status === 'generating' || investigation.status === 'failed') {
    return response.status(409).json({ success: false, message: 'This case is not ready for an accusation.', code: 'CASE_NOT_READY' });
  }
  if (!investigation.suspects.some((suspect) => suspect.suspectId === selectedSuspectId)) {
    return response.status(400).json({ success: false, message: 'Select a suspect from this case.', code: 'INVALID_SUSPECT' });
  }
  const progress = await UserProgress.findOne({ userId: request.auth.userId, investigationId: investigation._id });
  if (!progress) return response.status(404).json({ success: false, message: 'Investigation progress was not found.', code: 'NOT_FOUND' });
  if (progress.status === 'completed') {
    if (progress.selectedSuspectId !== selectedSuspectId) return response.status(409).json({ success: false, message: 'An accusation has already been submitted.', code: 'ACCUSATION_ALREADY_SUBMITTED' });
  } else {
    const completedAt = new Date();
    const updated = await UserProgress.findOneAndUpdate(
      { _id: progress._id, status: 'active', selectedSuspectId: null },
      { $set: { status: 'completed', selectedSuspectId, reasoning, score: selectedSuspectId === investigation.canonicalSolution.culpritId ? 100 : 0, completedAt } },
      { new: true },
    );
    if (!updated) return response.status(409).json({ success: false, message: 'An accusation has already been submitted.', code: 'ACCUSATION_ALREADY_SUBMITTED' });
  }
  await Investigation.updateOne({ _id: investigation._id }, { $set: { status: 'completed' } });
  const result = await buildResult(investigation, selectedSuspectId, await UserProgress.findById(progress._id).lean());
  response.json({ success: true, message: 'Accusation recorded.', data: result });
}

async function buildResult(investigation, selectedSuspectId, progress) {
  const solution = investigation.canonicalSolution;
  const evidence = await Evidence.find({ investigationId: investigation._id, evidenceId: { $in: solution.keyEvidenceIds } }).select('evidenceId title type description content timestamp').lean();
  const evidenceById = new Map(evidence.map((item) => [item.evidenceId, item]));
  const timelineById = new Map(investigation.timeline.map((event) => [event.eventId, event]));
  const culprit = investigation.suspects.find((suspect) => suspect.suspectId === solution.culpritId);
  const others = new Map(solution.otherSuspectExplanations.map((entry) => [entry.suspectId, entry.explanation]));
  const contradictions = new Map(solution.contradictionExplanations.map((entry) => [entry.contradictionId, entry.explanation]));
  const redHerrings = new Map(solution.redHerringExplanations.map((entry) => [entry.evidenceId, entry.explanation]));
  const allEvidence = await Evidence.find({ investigationId: investigation._id, evidenceId: { $in: [...redHerrings.keys()] } }).select('evidenceId title').lean();
  const titleByEvidenceId = new Map(allEvidence.map((item) => [item.evidenceId, item.title]));
  return {
    correct: selectedSuspectId === solution.culpritId,
    selectedSuspectId,
    actualCulprit: culprit,
    motive: solution.motive,
    method: solution.method,
    explanation: solution.explanation,
    importantEvidence: solution.supportingClues.map((clue) => ({
      ...clue,
      evidence: evidenceById.get(clue.evidenceId) || null,
    })),
    timelineReconstruction: solution.relevantTimeline.map((eventId) => timelineById.get(eventId)).filter(Boolean),
    contradictions: investigation.contradictions.map((item) => ({ ...item.toObject(), explanation: contradictions.get(item.contradictionId) })),
    redHerringExplanations: [...redHerrings.entries()].map(([evidenceId, explanation]) => ({ evidenceId, title: titleByEvidenceId.get(evidenceId), explanation })),
    otherSuspects: investigation.suspects.filter((item) => item.suspectId !== solution.culpritId).map((suspect) => ({ suspect, explanation: others.get(suspect.suspectId) })),
    score: progress.score,
    completedAt: progress.completedAt,
  };
}

export async function getResult(request, response) {
  const investigation = await Investigation.findOne({ _id: request.investigation._id, userId: request.auth.userId }).select('+canonicalSolution');
  const progress = await UserProgress.findOne({ userId: request.auth.userId, investigationId: request.investigation._id }).lean();
  if (!progress || progress.status !== 'completed' || !progress.selectedSuspectId) {
    return response.status(409).json({ success: false, message: 'Submit your accusation to reveal the solution.', code: 'RESULT_NOT_READY' });
  }
  if (investigation.status !== 'completed') await Investigation.updateOne({ _id: investigation._id }, { $set: { status: 'completed' } });
  response.json({ success: true, message: 'Case result loaded.', data: await buildResult(investigation, progress.selectedSuspectId, progress) });
}

export function invalidIdResponse(request, response, next) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(404).json({ success: false, message: 'Investigation not found.', code: 'NOT_FOUND' });
  }
  next();
}
