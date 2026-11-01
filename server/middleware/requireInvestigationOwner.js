import mongoose from 'mongoose';
import Investigation from '../models/Investigation.js';

export async function requireInvestigationOwner(request, response, next) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(404).json({ success: false, message: 'Investigation not found.', code: 'NOT_FOUND' });
  }
  try {
    const investigation = await Investigation.findOne({ _id: request.params.id, userId: request.auth.userId }).select('_id userId status');
    if (!investigation) {
      return response.status(404).json({ success: false, message: 'Investigation not found.', code: 'NOT_FOUND' });
    }
    request.investigation = investigation;
    next();
  } catch (error) {
    next(error);
  }
}
