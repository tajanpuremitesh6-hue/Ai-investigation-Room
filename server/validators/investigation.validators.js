import { z } from 'zod';

const idText = z.string().trim().min(1).max(80);
const cleanText = z.string().trim().min(2).max(2500);
const isoDate = z.iso.datetime({ offset: true });

export const createInvestigationSchema = z.object({
  scenario: z.string().trim().min(1).max(2000),
  genre: z.enum(['Murder Mystery', 'Theft', 'Disappearance', 'Corporate Espionage', 'Blackmail', 'General Mystery']).optional().default('General Mystery'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
}).strict();

export const accusationSchema = z.object({
  selectedSuspectId: z.string().trim().min(1).max(80),
  reasoning: z.string().trim().max(4000).optional().default(''),
}).strict();

export const scenarioAnalysisSchema = z.object({
  theme: cleanText,
  setting: cleanText,
  characters: z.array(z.object({ name: z.string().trim().min(1).max(120), role: z.string().trim().min(1).max(180) }).strict()).max(20),
  constraints: z.array(cleanText).max(20),
  mysteryHooks: z.array(cleanText).min(1).max(12),
}).strict();

export const blueprintSchema = z.object({
  title: z.string().trim().min(4).max(160),
  description: cleanText,
  incident: z.object({
    summary: cleanText,
    location: z.string().trim().min(2).max(240),
    occurredAt: isoDate,
    affectedPerson: z.string().trim().max(160),
  }).strict(),
  suspects: z.array(z.object({
    suspectId: idText,
    fullName: z.string().trim().min(2).max(120),
    age: z.number().int().min(18).max(120),
    occupation: z.string().trim().min(2).max(120),
    characterDescription: cleanText,
    relationship: cleanText,
    possibleMotive: cleanText,
    claimedAlibi: cleanText,
    background: cleanText,
  }).strict()).min(3).max(5),
  timeline: z.array(z.object({
    eventId: idText,
    timestamp: isoDate,
    description: cleanText,
    involvedSuspectIds: z.array(idText),
  }).strict()).min(4).max(20),
  contradictions: z.array(z.object({
    contradictionId: idText,
    description: cleanText,
    suspectId: idText,
    linkedEvidenceIds: z.array(idText).min(2),
  }).strict()).min(1).max(8),
  evidenceOutline: z.array(z.object({
    evidenceId: idText,
    title: z.string().trim().min(3).max(160),
    type: z.enum(['chat', 'image', 'cctv', 'document']),
    description: cleanText,
    timestamp: isoDate,
    relatedSuspectIds: z.array(idText),
    clueType: z.enum(['direct', 'indirect', 'red_herring', 'context']),
    intendedClue: cleanText,
  }).strict()).min(6).max(10),
  canonicalSolution: z.object({
    culpritId: idText,
    motive: cleanText,
    method: cleanText,
    relevantTimeline: z.array(idText).min(1),
    keyEvidenceIds: z.array(idText).min(2),
    explanation: cleanText,
    supportingClues: z.array(z.object({ evidenceId: idText, inference: cleanText }).strict()).min(2),
    contradictionExplanations: z.array(z.object({ contradictionId: idText, explanation: cleanText }).strict()),
    redHerringExplanations: z.array(z.object({ evidenceId: idText, explanation: cleanText }).strict()),
    otherSuspectExplanations: z.array(z.object({ suspectId: idText, explanation: cleanText }).strict()),
  }).strict(),
}).strict();

const messageSchema = z.object({
  sender: z.string().trim().min(1).max(120),
  receiver: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(1000),
  timestamp: isoDate,
  deleted: z.boolean(),
}).strict();

const metadataSchema = z.object({ key: z.string().trim().min(1).max(80), value: z.string().trim().max(1000) }).strict();

export const evidenceBatchSchema = z.object({
  items: z.array(z.object({
    evidenceId: idText,
    title: z.string().trim().min(3).max(160),
    type: z.enum(['chat', 'image', 'cctv', 'document']),
    description: cleanText,
    content: z.object({
      summary: cleanText,
      text: z.string().trim().max(6000),
      messages: z.array(messageSchema).max(20),
      metadata: z.array(metadataSchema).max(12),
    }).strict(),
    relatedSuspectIds: z.array(idText),
    timestamp: isoDate,
    clueType: z.enum(['direct', 'indirect', 'red_herring', 'context']),
  }).strict()).min(6).max(10),
}).strict();

export const evidenceAuditSchema = z.object({
  valid: z.boolean(),
  issues: z.array(z.string().trim().min(1).max(500)).max(12),
  items: z.array(z.object({
    evidenceId: idText,
    alignsWithBlueprint: z.boolean(),
    supportsIntendedClue: z.boolean(),
    revealsCulpritEarly: z.boolean(),
    explanation: z.string().trim().min(1).max(500),
  }).strict()).min(6).max(10),
}).strict();
