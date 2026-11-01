import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  investigationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investigation', required: true },
  evidenceId: { type: String, required: true },
  title: { type: String, required: true, maxlength: 160 },
  type: { type: String, enum: ['chat', 'image', 'cctv', 'document'], required: true },
  description: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed, default: null },
  mediaUrl: { type: String, default: null },
  mediaStatus: { type: String, enum: ['not_requested', 'ready', 'placeholder'], default: 'not_requested' },
  isFictional: { type: Boolean, default: true, immutable: true },
  relatedSuspectIds: { type: [String], default: [] },
  timestamp: Date,
  clueType: { type: String, enum: ['direct', 'indirect', 'red_herring', 'context'], default: 'context' },
}, { timestamps: true, versionKey: false });

evidenceSchema.index({ investigationId: 1, evidenceId: 1 }, { unique: true });
evidenceSchema.index({ investigationId: 1, timestamp: 1 });

export default mongoose.model('Evidence', evidenceSchema);
