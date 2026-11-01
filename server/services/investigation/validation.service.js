import { blueprintSchema, evidenceBatchSchema } from '../../validators/investigation.validators.js';

const difficultyRules = {
  Easy: { suspects: 3, evidence: 6 },
  Medium: { suspects: 4, evidence: 8 },
  Hard: { suspects: 5, evidence: 10 },
};
const requiredEvidenceTypes = ['chat', 'image', 'cctv', 'document'];

function fail(message) {
  const error = new Error(message);
  error.code = 'INVALID_MYSTERY';
  throw error;
}

function ensureUnique(values, label) {
  if (new Set(values).size !== values.length) fail(`${label} IDs must be unique.`);
}

export function validateBlueprint(rawBlueprint, difficulty) {
  const blueprint = blueprintSchema.parse(rawBlueprint);
  const rules = difficultyRules[difficulty];
  if (!rules || blueprint.suspects.length !== rules.suspects || blueprint.evidenceOutline.length !== rules.evidence) {
    fail('Generated suspect or evidence counts do not match the selected difficulty.');
  }

  const suspectIds = blueprint.suspects.map(({ suspectId }) => suspectId);
  const eventIds = blueprint.timeline.map(({ eventId }) => eventId);
  const evidenceIds = blueprint.evidenceOutline.map(({ evidenceId }) => evidenceId);
  const contradictionIds = blueprint.contradictions.map(({ contradictionId }) => contradictionId);
  ensureUnique(suspectIds, 'Suspect'); ensureUnique(eventIds, 'Timeline event');
  ensureUnique(evidenceIds, 'Evidence'); ensureUnique(contradictionIds, 'Contradiction');

  const suspectSet = new Set(suspectIds);
  const eventSet = new Set(eventIds);
  const evidenceById = new Map(blueprint.evidenceOutline.map((item) => [item.evidenceId, item]));
  const contradictionSet = new Set(contradictionIds);
  const canonical = blueprint.canonicalSolution;

  if (!suspectSet.has(canonical.culpritId)) fail('The canonical culprit must be one of the case suspects.');
  if (blueprint.timeline.some((event, index) => index && Date.parse(event.timestamp) < Date.parse(blueprint.timeline[index - 1].timestamp))) {
    fail('Timeline events must be chronological.');
  }
  for (const event of blueprint.timeline) {
    if (event.involvedSuspectIds.some((id) => !suspectSet.has(id))) fail('A timeline event references an unknown suspect.');
  }
  const timelineTimes = blueprint.timeline.map(({ timestamp }) => Date.parse(timestamp));
  const incidentTime = Date.parse(blueprint.incident.occurredAt);
  const firstTimelineTime = Math.min(...timelineTimes);
  const lastTimelineTime = Math.max(...timelineTimes);
  if (incidentTime < firstTimelineTime || incidentTime > lastTimelineTime) {
    fail('The incident time must fit within the investigation timeline.');
  }
  for (const item of blueprint.evidenceOutline) {
    if (item.relatedSuspectIds.some((id) => !suspectSet.has(id))) fail('Evidence references an unknown suspect.');
    const evidenceTime = Date.parse(item.timestamp);
    if (evidenceTime < firstTimelineTime || evidenceTime > lastTimelineTime) fail('Evidence timestamps must fit within the case timeline.');
  }
  if (requiredEvidenceTypes.some((type) => !blueprint.evidenceOutline.some((item) => item.type === type))) {
    fail('The case must include chat, image, CCTV, and document evidence.');
  }
  if (canonical.relevantTimeline.some((id) => !eventSet.has(id))) fail('The canonical solution references an unknown timeline event.');
  ensureUnique(canonical.keyEvidenceIds, 'Key clue');
  if (canonical.keyEvidenceIds.some((id) => !evidenceById.has(id))) fail('A key clue references missing evidence.');
  if (canonical.supportingClues.length < 2 || canonical.supportingClues.some((clue) => !canonical.keyEvidenceIds.includes(clue.evidenceId))) {
    fail('At least two key clues must directly support the canonical solution.');
  }
  ensureUnique(canonical.supportingClues.map(({ evidenceId }) => evidenceId), 'Supporting clue');
  const supportingTypes = new Set(canonical.supportingClues.map(({ evidenceId }) => evidenceById.get(evidenceId)?.type));
  if (supportingTypes.size < 2 || canonical.supportingClues.some(({ evidenceId }) => evidenceById.get(evidenceId)?.clueType === 'red_herring')) {
    fail('At least two independent non-red-herring clues must support the solution.');
  }
  for (const contradiction of blueprint.contradictions) {
    ensureUnique(contradiction.linkedEvidenceIds, 'Contradiction evidence');
    if (!suspectSet.has(contradiction.suspectId) || contradiction.linkedEvidenceIds.some((id) => !evidenceById.has(id))) {
      fail('A contradiction references a missing suspect or evidence item.');
    }
  }
  const explainedContradictionIds = canonical.contradictionExplanations.map(({ contradictionId }) => contradictionId);
  if (explainedContradictionIds.length !== contradictionSet.size || new Set(explainedContradictionIds).size !== contradictionSet.size || explainedContradictionIds.some((id) => !contradictionSet.has(id))) {
    fail('Every contradiction must have exactly one private explanation.');
  }
  const redHerrings = blueprint.evidenceOutline.filter((item) => item.clueType === 'red_herring').map((item) => item.evidenceId);
  const explainedRedHerrings = canonical.redHerringExplanations.map(({ evidenceId }) => evidenceId);
  if (redHerrings.length !== explainedRedHerrings.length || new Set(explainedRedHerrings).size !== redHerrings.length || redHerrings.some((id) => !explainedRedHerrings.includes(id))) {
    fail('Every red herring must have a private explanation.');
  }
  const expectedNonCulprits = suspectIds.filter((id) => id !== canonical.culpritId).sort();
  const explainedNonCulprits = canonical.otherSuspectExplanations.map(({ suspectId }) => suspectId).sort();
  if (expectedNonCulprits.join('|') !== explainedNonCulprits.join('|')) fail('Every non-culprit suspect must have a private explanation.');
  return blueprint;
}

export function validateEvidence(rawBatch, blueprint) {
  const batch = evidenceBatchSchema.parse(rawBatch);
  if (batch.items.length !== blueprint.evidenceOutline.length) fail('Evidence count differs from the approved blueprint.');
  ensureUnique(batch.items.map(({ evidenceId }) => evidenceId), 'Evidence');
  const expected = new Map(blueprint.evidenceOutline.map((item) => [item.evidenceId, item]));
  const suspectNames = new Set([
    ...blueprint.suspects.map(({ fullName }) => fullName.toLocaleLowerCase()),
    blueprint.incident.affectedPerson.toLocaleLowerCase(),
  ].filter(Boolean));

  for (const item of batch.items) {
    const plan = expected.get(item.evidenceId);
    if (!plan || item.type !== plan.type || item.clueType !== plan.clueType || Date.parse(item.timestamp) !== Date.parse(plan.timestamp)) {
      fail('Generated evidence does not match its approved evidence plan.');
    }
    if (item.relatedSuspectIds.some((id) => !blueprint.suspects.some((suspect) => suspect.suspectId === id))) {
      fail('Generated evidence references an unknown suspect.');
    }
    if (plan.relatedSuspectIds.some((id) => !item.relatedSuspectIds.includes(id))) {
      fail('Generated evidence omits an approved related suspect.');
    }
    const hasBody = Boolean(item.content.text || item.content.messages.length || item.content.metadata.length);
    if (!hasBody) fail('Generated evidence has no readable content.');
    for (const message of item.content.messages) {
      if (!suspectNames.has(message.sender.toLocaleLowerCase()) || !suspectNames.has(message.receiver.toLocaleLowerCase())) {
        fail('A fictional chat references a participant not present in the case.');
      }
      if (Date.parse(message.timestamp) > Date.parse(item.timestamp)) fail('A chat message occurs after its evidence timestamp.');
    }
    if (item.type === 'cctv') {
      const metadata = new Set(item.content.metadata.map(({ key }) => key.toLocaleLowerCase()));
      if (!metadata.has('camera id') || !metadata.has('camera location')) fail('CCTV evidence must include camera ID and location metadata.');
    }
  }
  if ([...expected.keys()].some((id) => !batch.items.some((item) => item.evidenceId === id))) fail('Generated evidence is missing an approved item.');
  return batch;
}
