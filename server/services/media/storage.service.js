import { mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { env } from '../../config/env.js';

const serverRoot = fileURLToPath(new URL('../../', import.meta.url));
export const mediaStorageDirectory = path.resolve(serverRoot, env.mediaStoragePath);

function imageExtension(mimeType) {
  return { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[mimeType] || null;
}

function validImage(buffer, mimeType) {
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/webp') return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

export async function saveGeneratedImage(base64, mimeType = 'image/png') {
  const extension = imageExtension(mimeType);
  if (!extension) throw new Error('Unsupported generated image format.');
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length || buffer.length > 8 * 1024 * 1024 || !validImage(buffer, mimeType)) {
    throw new Error('Generated image failed media validation.');
  }
  await mkdir(mediaStorageDirectory, { recursive: true });
  const name = `${randomUUID()}.${extension}`;
  const finalPath = path.join(mediaStorageDirectory, name);
  const temporaryPath = `${finalPath}.tmp`;
  await writeFile(temporaryPath, buffer, { flag: 'wx' });
  await rename(temporaryPath, finalPath);
  return `/api/v1/media/${name}`;
}

export async function removeGeneratedMedia(urls = []) {
  await Promise.all(urls.map(async (url) => {
    const fileName = String(url || '').replace(/^\/api\/v1\/media\//, '');
    if (!/^[a-f0-9-]{36}\.(png|jpg|webp)$/i.test(fileName)) return;
    try { await unlink(path.join(mediaStorageDirectory, fileName)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }));
}
