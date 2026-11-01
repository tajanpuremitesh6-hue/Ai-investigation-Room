import mongoose from 'mongoose';
import DetectiveNote from '../models/DetectiveNote.js';
import Evidence from '../models/Evidence.js';
import Investigation from '../models/Investigation.js';
import UserProgress from '../models/UserProgress.js';

function notFound(response) {
  return response.status(404).json({ success: false, message: 'Investigation item not found.', code: 'NOT_FOUND' });
}

export async function suspects(request, response) {
  const investigation = await Investigation.findById(request.investigation._id).select('suspects status').lean();
  response.json({ success: true, message: 'Suspects loaded.', data: { suspects: investigation.suspects, status: investigation.status } });
}

export async function timeline(request, response) {
  const investigation = await Investigation.findById(request.investigation._id).select('timeline status').lean();
  response.json({ success: true, message: 'Timeline loaded.', data: { timeline: investigation.timeline, status: investigation.status } });
}

export async function evidenceList(request, response) {
  const evidence = await Evidence.find({ investigationId: request.investigation._id }).sort({ timestamp: 1, createdAt: 1 }).lean();
  const progress = await UserProgress.findOne({ userId: request.auth.userId, investigationId: request.investigation._id }).select('openedEvidenceIds bookmarkedEvidenceIds').lean();
  const publicEvidence = evidence.map(({ clueType: _clueType, ...item }) => ({
    ...item,
    opened: progress?.openedEvidenceIds.includes(item.evidenceId) || false,
    bookmarked: progress?.bookmarkedEvidenceIds.includes(item.evidenceId) || false,
  }));
  response.json({ success: true, message: 'Evidence loaded.', data: { evidence: publicEvidence } });
}

async function verifyEvidence(request, response) {
  const evidence = await Evidence.findOne({ investigationId: request.investigation._id, evidenceId: request.params.evidenceId }).select('evidenceId').lean();
  if (!evidence) return notFound(response);
  return evidence;
}

export async function markEvidenceOpened(request, response) {
  const evidence = await verifyEvidence(request, response);
  if (!evidence) return;
  await UserProgress.updateOne({ userId: request.auth.userId, investigationId: request.investigation._id }, { $addToSet: { openedEvidenceIds: evidence.evidenceId } });
  response.json({ success: true, message: 'Evidence marked as reviewed.', data: { opened: true } });
}

export async function setEvidenceBookmark(request, response) {
  const evidence = await verifyEvidence(request, response);
  if (!evidence) return;
  const operation = request.body?.bookmarked ? '$addToSet' : '$pull';
  await UserProgress.updateOne({ userId: request.auth.userId, investigationId: request.investigation._id }, { [operation]: { bookmarkedEvidenceIds: evidence.evidenceId } });
  response.json({ success: true, message: 'Bookmark updated.', data: { bookmarked: Boolean(request.body?.bookmarked) } });
}

export async function notesList(request, response) {
  const notes = await DetectiveNote.find({ userId: request.auth.userId, investigationId: request.investigation._id }).sort({ updatedAt: -1 }).lean();
  response.json({ success: true, message: 'Notes loaded.', data: { notes } });
}

async function validateNoteLinks(request, links) {
  const { linkedSuspectId, linkedEvidenceId } = links;
  if (linkedSuspectId) {
    const caseHasSuspect = await Investigation.exists({ _id: request.investigation._id, 'suspects.suspectId': linkedSuspectId });
    if (!caseHasSuspect) {
      const error = new Error('The selected suspect is not part of this investigation.'); error.status = 400; error.code = 'INVALID_SUSPECT_LINK'; throw error;
    }
  }
  if (linkedEvidenceId) {
    const caseHasEvidence = await Evidence.exists({ investigationId: request.investigation._id, evidenceId: linkedEvidenceId });
    if (!caseHasEvidence) {
      const error = new Error('The selected evidence is not part of this investigation.'); error.status = 400; error.code = 'INVALID_EVIDENCE_LINK'; throw error;
    }
  }
}

export async function createNote(request, response) {
  await validateNoteLinks(request, request.validatedBody);
  const note = await DetectiveNote.create({ userId: request.auth.userId, investigationId: request.investigation._id, ...request.validatedBody });
  response.status(201).json({ success: true, message: 'Note created.', data: { note } });
}

export async function updateNote(request, response) {
  if (!mongoose.isValidObjectId(request.params.noteId)) return notFound(response);
  if (!Object.keys(request.validatedBody).length) {
    return response.status(400).json({ success: false, message: 'Provide at least one field to update.', code: 'EMPTY_UPDATE' });
  }
  const current = await DetectiveNote.findOne({ _id: request.params.noteId, userId: request.auth.userId, investigationId: request.investigation._id });
  if (!current) return notFound(response);
  const mergedLinks = { linkedSuspectId: current.linkedSuspectId, linkedEvidenceId: current.linkedEvidenceId, ...request.validatedBody };
  await validateNoteLinks(request, mergedLinks);
  Object.assign(current, request.validatedBody);
  await current.save();
  response.json({ success: true, message: 'Note updated.', data: { note: current } });
}

export async function deleteNote(request, response) {
  if (!mongoose.isValidObjectId(request.params.noteId)) return notFound(response);
  const result = await DetectiveNote.deleteOne({ _id: request.params.noteId, userId: request.auth.userId, investigationId: request.investigation._id });
  if (!result.deletedCount) return notFound(response);
  response.json({ success: true, message: 'Note deleted.', data: { deleted: true } });
}
