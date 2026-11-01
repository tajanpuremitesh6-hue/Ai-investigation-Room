import express from 'express';
import { waitUntil } from '@vercel/functions';
import app from './server/app.js';
import { setGenerationScheduler } from './server/services/investigation/generation.service.js';

const vercelApp = express();
vercelApp.use(app);

setGenerationScheduler((task) => waitUntil(Promise.resolve().then(task)));

export default vercelApp;
