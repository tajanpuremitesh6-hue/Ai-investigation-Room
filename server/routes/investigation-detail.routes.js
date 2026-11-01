import { Router } from 'express';
import {
  createNote, deleteNote, evidenceList, markEvidenceOpened, notesList, setEvidenceBookmark, suspects, timeline, updateNote,
} from '../controllers/investigation-detail.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireInvestigationOwner } from '../middleware/requireInvestigationOwner.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNoteSchema, evidenceBookmarkSchema, updateNoteSchema } from '../validators/note.validators.js';

const router = Router({ mergeParams: true });
router.use(requireAuth, requireInvestigationOwner);
router.get('/evidence', asyncHandler(evidenceList));
router.post('/evidence/:evidenceId/open', asyncHandler(markEvidenceOpened));
router.put('/evidence/:evidenceId/bookmark', validateRequest(evidenceBookmarkSchema), asyncHandler(setEvidenceBookmark));
router.get('/suspects', asyncHandler(suspects));
router.get('/timeline', asyncHandler(timeline));
router.get('/notes', asyncHandler(notesList));
router.post('/notes', validateRequest(createNoteSchema), asyncHandler(createNote));
router.put('/notes/:noteId', validateRequest(updateNoteSchema), asyncHandler(updateNote));
router.delete('/notes/:noteId', asyncHandler(deleteNote));

export default router;
