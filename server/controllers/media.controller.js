import path from 'node:path';
import Evidence from '../models/Evidence.js';
import Investigation from '../models/Investigation.js';
import { mediaStorageDirectory } from '../services/media/storage.service.js';

export async function getMedia(request, response, next) {
  const fileName = request.params.fileName;
  if (!/^[a-f0-9-]{36}\.(png|jpg|webp)$/i.test(fileName)) {
    return response.status(404).json({ success: false, message: 'Media not found.', code: 'NOT_FOUND' });
  }
  try {
    const evidence = await Evidence.findOne({ mediaUrl: `/api/v1/media/${fileName}` }).select('investigationId');
    if (!evidence || !await Investigation.exists({ _id: evidence.investigationId, userId: request.auth.userId })) {
      return response.status(404).json({ success: false, message: 'Media not found.', code: 'NOT_FOUND' });
    }
    response.set('X-Content-Type-Options', 'nosniff');
    response.sendFile(path.join(mediaStorageDirectory, fileName), (error) => { if (error) next(error); });
  } catch (error) { next(error); }
}
