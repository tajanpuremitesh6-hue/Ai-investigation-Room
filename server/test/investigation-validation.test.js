import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import Investigation from '../models/Investigation.js';
import { createInvestigationSchema } from '../validators/investigation.validators.js';
import { validateBlueprint, validateEvidence } from '../services/investigation/validation.service.js';

const suspects = [
  { suspectId: 'suspect_1', fullName: 'Avery Stone', age: 42, occupation: 'Archivist', characterDescription: 'A precise keeper of records.', relationship: 'Worked for the affected person.', possibleMotive: 'A disputed inheritance.', claimedAlibi: 'They were cataloguing letters.', background: 'They have worked at the estate for years.' },
  { suspectId: 'suspect_2', fullName: 'Morgan Reed', age: 35, occupation: 'Restorer', characterDescription: 'A patient craftsperson.', relationship: 'Restored items at the house.', possibleMotive: 'A late payment.', claimedAlibi: 'They left before midnight.', background: 'They know the house layout.' },
  { suspectId: 'suspect_3', fullName: 'Riley Quinn', age: 29, occupation: 'Courier', characterDescription: 'A quick and observant courier.', relationship: 'Delivered a package.', possibleMotive: 'A private disagreement.', claimedAlibi: 'They were outside the grounds.', background: 'They arrived shortly before the incident.' },
];

const timestamp = (hour) => `2026-08-01T${String(hour).padStart(2, '0')}:00:00Z`;

function makeBlueprint() {
  const evidenceOutline = [
    { evidenceId: 'clue_1', title: 'Message thread', type: 'chat', description: 'A fictional message exchange.', timestamp: timestamp(11), relatedSuspectIds: ['suspect_1'], clueType: 'direct', intendedClue: 'The sender knew the archive was open.' },
    { evidenceId: 'clue_2', title: 'Repair invoice', type: 'document', description: 'A fictional invoice.', timestamp: timestamp(12), relatedSuspectIds: ['suspect_2'], clueType: 'indirect', intendedClue: 'The listed repair happened after the alibi.' },
    { evidenceId: 'clue_3', title: 'Desk photograph', type: 'image', description: 'A fictional photograph of a desk.', timestamp: timestamp(13), relatedSuspectIds: ['suspect_1'], clueType: 'context', intendedClue: 'A notebook is visible beside the lamp.' },
    { evidenceId: 'clue_4', title: 'North camera record', type: 'cctv', description: 'A fictional security camera record.', timestamp: timestamp(14), relatedSuspectIds: ['suspect_3'], clueType: 'context', intendedClue: 'A person crosses the courtyard.' },
    { evidenceId: 'clue_5', title: 'Torn letter', type: 'document', description: 'A fictional letter fragment.', timestamp: timestamp(15), relatedSuspectIds: ['suspect_2'], clueType: 'context', intendedClue: 'The letter refers to a meeting.' },
    { evidenceId: 'clue_6', title: 'Second conversation', type: 'chat', description: 'A fictional conversation.', timestamp: timestamp(16), relatedSuspectIds: ['suspect_1'], clueType: 'context', intendedClue: 'The conversation confirms the delivery time.' },
  ];
  const timeline = [
    { eventId: 'event_1', timestamp: timestamp(10), description: 'The staff arrive at the house.', involvedSuspectIds: ['suspect_1', 'suspect_2'] },
    { eventId: 'event_2', timestamp: timestamp(12), description: 'The archive is opened.', involvedSuspectIds: ['suspect_1'] },
    { eventId: 'event_3', timestamp: timestamp(14), description: 'A package reaches the courtyard.', involvedSuspectIds: ['suspect_3'] },
    { eventId: 'event_4', timestamp: timestamp(16), description: 'The missing object is noticed.', involvedSuspectIds: ['suspect_1', 'suspect_2', 'suspect_3'] },
  ];
  return {
    title: 'The Quiet Archive', description: 'A locked archive and one missing journal.',
    incident: { summary: 'A journal disappeared from a locked archive.', location: 'North archive', occurredAt: timestamp(12), affectedPerson: 'Casey Bell' },
    suspects, timeline,
    contradictions: [{ contradictionId: 'contradiction_1', description: 'The time on the invoice differs from the claimed alibi.', suspectId: 'suspect_2', linkedEvidenceIds: ['clue_1', 'clue_2'] }],
    evidenceOutline,
    canonicalSolution: {
      culpritId: 'suspect_1', motive: 'The journal could expose an old forgery.', method: 'The archive key was copied.', relevantTimeline: ['event_2', 'event_4'], keyEvidenceIds: ['clue_1', 'clue_2'], explanation: 'The message and invoice establish the access window.',
      supportingClues: [{ evidenceId: 'clue_1', inference: 'The sender knew the archive was open.' }, { evidenceId: 'clue_2', inference: 'The invoice places the repair later than claimed.' }],
      contradictionExplanations: [{ contradictionId: 'contradiction_1', explanation: 'The invoice was altered to support a false time.' }],
      redHerringExplanations: [],
      otherSuspectExplanations: [{ suspectId: 'suspect_2', explanation: 'The invoice looked suspicious but was altered by another person.' }, { suspectId: 'suspect_3', explanation: 'The courier arrived after the journal was moved.' }],
    },
  };
}

function makeEvidence(blueprint) {
  return { items: blueprint.evidenceOutline.map((item) => ({
    evidenceId: item.evidenceId,
    title: item.title,
    type: item.type,
    description: item.description,
    content: {
      summary: item.intendedClue,
      text: item.type === 'chat' ? '' : item.intendedClue,
      messages: item.type === 'chat' ? [{ sender: 'Avery Stone', receiver: 'Casey Bell', content: 'The archive is open.', timestamp: item.timestamp, deleted: false }] : [],
      metadata: item.type === 'cctv' ? [{ key: 'Camera ID', value: 'N-04' }, { key: 'Camera Location', value: 'North courtyard' }] : [],
    },
    relatedSuspectIds: item.relatedSuspectIds,
    timestamp: item.timestamp,
    clueType: item.clueType,
  })) };
}

test('scenario requests enforce non-empty input and the 2,000 character limit', () => {
  assert.equal(createInvestigationSchema.safeParse({ scenario: 'A mystery begins.', difficulty: 'Easy' }).success, true);
  assert.equal(createInvestigationSchema.safeParse({ scenario: '   ', difficulty: 'Easy' }).success, false);
  assert.equal(createInvestigationSchema.safeParse({ scenario: 'x'.repeat(2001), difficulty: 'Easy' }).success, false);
});

test('blueprint validation accepts a solvable case and rejects missing canonical culprit', () => {
  const blueprint = makeBlueprint();
  assert.equal(validateBlueprint(blueprint, 'Easy').canonicalSolution.culpritId, 'suspect_1');
  const invalid = structuredClone(blueprint);
  invalid.canonicalSolution.culpritId = 'unknown';
  assert.throws(() => validateBlueprint(invalid, 'Easy'), /canonical culprit/);
});

test('blueprint validation rejects mismatched difficulty counts and weak clue support', () => {
  const wrongCount = makeBlueprint();
  assert.throws(() => validateBlueprint(wrongCount, 'Medium'), /counts do not match/);
  const weakClues = makeBlueprint();
  weakClues.canonicalSolution.supportingClues = [weakClues.canonicalSolution.supportingClues[0], weakClues.canonicalSolution.supportingClues[0]];
  assert.throws(() => validateBlueprint(weakClues, 'Easy'), /Supporting clue IDs must be unique/);
});

test('evidence validation accepts complete evidence and rejects timeline/type drift', () => {
  const blueprint = validateBlueprint(makeBlueprint(), 'Easy');
  const batch = makeEvidence(blueprint);
  assert.equal(validateEvidence(batch, blueprint).items.length, 6);
  const invalid = structuredClone(batch);
  invalid.items[0].type = 'document';
  assert.throws(() => validateEvidence(invalid, blueprint), /does not match its approved evidence plan/);
});

test('private authentication and solution fields default to excluded projections', () => {
  assert.equal(User.schema.path('passwordHash').options.select, false);
  assert.equal(Investigation.schema.path('canonicalSolution').options.select, false);
});
