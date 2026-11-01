import { env } from '../../config/env.js';
import { getGeminiClient } from '../gemini/client.js';
import { saveGeneratedImage } from './storage.service.js';

function imagePrompt(item, timestamp) {
  const visualType = item.type === 'cctv' ? 'a fictional, low-resolution security camera still frame' : 'a fictional investigative evidence photograph';
  return `${visualType}. Create a believable, non-graphic visual of this invented evidence: ${item.description}. Observation to depict: ${item.content.summary}. The scene and all people are fictional. Do not add captions, readable text, labels, logos, real public figures, or identifying marks. Timestamp for the separate UI overlay: ${timestamp}. Cinematic documentary realism, subdued colors.`;
}

async function generateOne(item) {
  const interaction = await getGeminiClient().interactions.create({
    model: env.geminiImageModel,
    input: imagePrompt(item, item.timestamp),
    response_format: { type: 'image', mime_type: 'image/png', aspect_ratio: '4:3', image_size: '1K' },
  });
  if (!interaction.output_image?.data) throw new Error('The image model returned no image.');
  return saveGeneratedImage(interaction.output_image.data, interaction.output_image.mime_type || 'image/png');
}

export async function generateOptionalCaseMedia(items) {
  const generated = new Map();
  if (!env.enableImageGeneration || !env.geminiImageModel || !env.geminiApiKey) return generated;

  const targets = ['image', 'cctv'].flatMap((type) => {
    const item = items.find((evidence) => evidence.type === type);
    return item ? [item] : [];
  });
  for (const item of targets) {
    try {
      generated.set(item.evidenceId, await generateOne(item));
    } catch (error) {
      console.warn(`Optional ${item.type} media failed for ${item.evidenceId} (${error.code || 'media_error'}).`);
    }
  }
  return generated;
}
