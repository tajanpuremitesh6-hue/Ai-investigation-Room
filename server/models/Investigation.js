import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema({
  suspectId: { type: String, required: true },
  fullName: { type: String, required: true },
  age: { type: Number, min: 1, max: 120 },
  occupation: String,
  characterDescription: String,
  relationship: String,
  possibleMotive: String,
  claimedAlibi: String,
  background: String,
  portraitUrl: String,
}, { _id: false });

const timelineEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  description: { type: String, required: true },
  involvedSuspectIds: [String],
}, { _id: false });

const incidentSchema = new mongoose.Schema({
  summary: { type: String, default: '' },
  location: { type: String, default: '' },
  occurredAt: Date,
  affectedPerson: { type: String, default: '' },
}, { _id: false });

const contradictionSchema = new mongoose.Schema({
  contradictionId: { type: String, required: true },
  description: { type: String, required: true },
  suspectId: { type: String, required: true },
  linkedEvidenceIds: { type: [String], default: [] },
}, { _id: false });

const supportingClueSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true },
  inference: { type: String, required: true },
}, { _id: false });

const contradictionExplanationSchema = new mongoose.Schema({
  contradictionId: { type: String, required: true },
  explanation: { type: String, required: true },
}, { _id: false });

const redHerringExplanationSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true },
  explanation: { type: String, required: true },
}, { _id: false });

const otherSuspectExplanationSchema = new mongoose.Schema({
  suspectId: { type: String, required: true },
  explanation: { type: String, required: true },
}, { _id: false });

const canonicalSolutionSchema = new mongoose.Schema({
  culpritId: { type: String, required: true },
  motive: { type: String, required: true },
  method: { type: String, required: true },
  relevantTimeline: [String],
  keyEvidenceIds: [String],
  explanation: { type: String, required: true },
  supportingClues: [supportingClueSchema],
  contradictionExplanations: [contradictionExplanationSchema],
  redHerringExplanations: [redHerringExplanationSchema],
  otherSuspectExplanations: [otherSuspectExplanationSchema],
}, { _id: false });

const investigationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generationId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, default: '', maxlength: 2500 },
  scenario: { type: String, required: true, maxlength: 2000 },
  genre: { type: String, enum: ['Murder Mystery', 'Theft', 'Disappearance', 'Corporate Espionage', 'Blackmail', 'General Mystery'], default: 'General Mystery' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  status: { type: String, enum: ['generating', 'active', 'completed', 'failed'], default: 'generating', index: true },
  generationStatus: { type: String, enum: ['queued', 'analyzing', 'blueprint', 'validating', 'evidence', 'media', 'published', 'failed'], default: 'queued' },
  failureMessage: { type: String, default: null, select: false },
  incident: { type: incidentSchema, default: () => ({}) },
  suspects: { type: [suspectSchema], default: [] },
  timeline: { type: [timelineEventSchema], default: [] },
  contradictions: { type: [contradictionSchema], default: [] },
  canonicalSolution: { type: canonicalSolutionSchema, select: false },
}, { timestamps: true, versionKey: false });

investigationSchema.index({ userId: 1, createdAt: -1 });
investigationSchema.pre('save', async function protectPublishedSolution() {
  if (this.isNew || !this.isModified('canonicalSolution')) return;
  const persisted = await this.constructor.findById(this._id).select('status');
  if (persisted && ['active', 'completed'].includes(persisted.status)) {
    throw new Error('A published canonical solution is immutable.');
  }
});

export default mongoose.model('Investigation', investigationSchema);
