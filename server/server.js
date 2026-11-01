import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { recoverInterruptedGenerations } from './services/investigation/generation.service.js';

try {
  const connected = await connectDatabase(env.mongoUri);
  if (connected) await recoverInterruptedGenerations();
  app.listen(env.port, () => console.info(`API listening on http://localhost:${env.port}`));
} catch (error) {
  console.error(`Unable to connect to MongoDB (${error.code || 'database_error'}).`);
  process.exit(1);
}
