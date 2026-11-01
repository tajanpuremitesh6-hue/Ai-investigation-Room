import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investigation', required: true },
  openedEvidenceIds: { type: [String], default: [] },
  bookmarkedEvidenceIds: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  selectedSuspectId: { type: String, default: null },
  reasoning: { type: String, maxlength: 4000, default: '' },
  score: { type: Number, min: 0, max: 100, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

userProgressSchema.index({ userId: 1, investigationId: 1 }, { unique: true });

export default mongoose.model('UserProgress', userProgressSchema);
