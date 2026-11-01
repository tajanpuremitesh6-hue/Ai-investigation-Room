import { waitUntil } from '@vercel/functions';
import app from './server/app.js';
import { setGenerationScheduler } from './server/services/investigation/generation.service.js';

setGenerationScheduler((task) => waitUntil(Promise.resolve().then(task)));

export default app;
