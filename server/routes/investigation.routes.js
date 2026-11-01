import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { accuse, create, generationStatus, getOne, getResult, list, remove } from '../controllers/investigation.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireInvestigationOwner } from '../middleware/requireInvestigationOwner.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { accusationSchema, createInvestigationSchema } from '../validators/investigation.validators.js';

const router = Router();
const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({ success: false, message: 'You have reached the investigation generation limit. Try again later.', code: 'RATE_LIMITED' }),
});

router.use(requireAuth);
router.post('/', generationLimiter, validateRequest(createInvestigationSchema), asyncHandler(create));
router.get('/', asyncHandler(list));
router.get('/:id/generation-status', requireInvestigationOwner, asyncHandler(generationStatus));
router.post('/:id/accusation', requireInvestigationOwner, validateRequest(accusationSchema), asyncHandler(accuse));
router.get('/:id/result', requireInvestigationOwner, asyncHandler(getResult));
router.get('/:id', requireInvestigationOwner, asyncHandler(getOne));
router.delete('/:id', requireInvestigationOwner, asyncHandler(remove));

export default router;
