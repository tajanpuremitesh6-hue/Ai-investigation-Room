import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { env } from '../../config/env.js';

let client;

export function getGeminiClient() {
  if (!env.geminiApiKey) {
    const error = new Error('Gemini is not configured. Add GEMINI_API_KEY to the server environment.');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }
  client ??= new GoogleGenAI({ apiKey: env.geminiApiKey });
  return client;
}

function toProviderSchema(zodSchema) {
  const schema = structuredClone(z.toJSONSchema(zodSchema));
  delete schema.$schema;
  // Gemini's constrained decoder can reject schemas with large array bounds
  // as too complex (HTTP 400). Zod still enforces these limits after parsing.
  const simplifyArrayBounds = (value) => {
    if (Array.isArray(value)) return value.map(simplifyArrayBounds);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => key !== 'maxItems')
      .map(([key, nested]) => [key, simplifyArrayBounds(nested)]));
  };
  return simplifyArrayBounds(schema);
}

export async function generateJson({ schema, prompt, systemInstruction }) {
  const jsonSchema = toProviderSchema(schema);
  const interaction = await getGeminiClient().interactions.create({
    model: env.geminiTextModel,
    system_instruction: systemInstruction,
    input: prompt,
    response_format: { type: 'text', mime_type: 'application/json', schema: jsonSchema },
    generation_config: { max_output_tokens: 16000, temperature: 0.8 },
  }, {
    // Bound each generation so a stalled provider request cannot leave a case
    // in the same stage indefinitely. The application owns any deliberate retry.
    timeout_ms: 90_000,
    maxRetries: 0,
  });
  if (!interaction.output_text) {
    const error = new Error('Gemini returned no text output.');
    error.code = 'EMPTY_AI_RESPONSE';
    throw error;
  }
  try {
    return JSON.parse(interaction.output_text);
  } catch {
    const error = new Error('Gemini returned invalid JSON.');
    error.code = 'INVALID_AI_JSON';
    throw error;
  }
}
