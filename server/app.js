import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import healthRoutes from './routes/health.routes.js';
import investigationRoutes from './routes/investigation.routes.js';
import mediaRoutes from './routes/media.routes.js';
import investigationDetailRoutes from './routes/investigation-detail.routes.js';
import { asyncHandler } from './utils/asyncHandler.js';

const app = express();
app.use(cors({ origin: env.clientUrl }));
app.use(express.json({ limit: '32kb' }));
app.get('/', (_request, response) => response.redirect(302, '/index.html'));
app.use(asyncHandler(async (_request, _response, next) => {
  await connectDatabase(env.mongoUri);
  next();
}));

app.get('/api/v1', (_request, response) => {
  response.json({ success: true, message: 'AI Mystery Room API', data: { version: 'v1' } });
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/investigations', investigationRoutes);
app.use('/api/v1/investigations/:id', investigationDetailRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use((_request, response) => {
  response.status(404).json({ success: false, message: 'Route not found.', code: 'NOT_FOUND' });
});
app.use(errorHandler);

export default app;
