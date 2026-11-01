import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiTextModel: process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash',
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL,
  enableImageGeneration: process.env.ENABLE_IMAGE_GENERATION === 'true',
  mediaStoragePath: process.env.MEDIA_STORAGE_PATH || './storage',
};
