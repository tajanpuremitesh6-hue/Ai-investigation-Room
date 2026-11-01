import mongoose from 'mongoose';

const detectiveNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investigation', required: true },
  content: { type: String, required: true, trim: true, maxlength: 5000 },
  linkedSuspectId: { type: String, default: null },
  linkedEvidenceId: { type: String, default: null },
}, { timestamps: true, versionKey: false });

detectiveNoteSchema.index({ userId: 1, investigationId: 1, updatedAt: -1 });

export default mongoose.model('DetectiveNote', detectiveNoteSchema);
