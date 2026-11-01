import { Router } from 'express';
import { getMedia } from '../controllers/media.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/:fileName', requireAuth, asyncHandler(getMedia));
export default router;
