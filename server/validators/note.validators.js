import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  linkedSuspectId: z.string().trim().min(1).max(80).optional().nullable(),
  linkedEvidenceId: z.string().trim().min(1).max(80).optional().nullable(),
}).strict();

export const updateNoteSchema = createNoteSchema.partial().strict();

export const evidenceBookmarkSchema = z.object({ bookmarked: z.boolean() }).strict();
