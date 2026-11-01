import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { login, me, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, registerSchema } from '../validators/auth.validators.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({ success: false, message: 'Too many sign-in attempts. Try again in a few minutes.', code: 'RATE_LIMITED' }),
});

router.post('/register', authLimiter, validateRequest(registerSchema), asyncHandler(register));
router.post('/login', authLimiter, validateRequest(loginSchema), asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
