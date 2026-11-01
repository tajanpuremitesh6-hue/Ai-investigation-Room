import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(request, response, next) {
  const [scheme, token] = (request.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ success: false, message: 'Authentication is required.', code: 'UNAUTHENTICATED' });
  }
  if (!env.jwtSecret) {
    return response.status(503).json({ success: false, message: 'Authentication is not configured.', code: 'AUTH_UNAVAILABLE' });
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    request.auth = { userId: payload.sub };
    next();
  } catch {
    response.status(401).json({ success: false, message: 'Your session is invalid or expired.', code: 'INVALID_TOKEN' });
  }
}
