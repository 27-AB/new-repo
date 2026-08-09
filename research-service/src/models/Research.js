// research-service/src/models/Research.js
const mongoose = require("mongoose");

const researchSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  lead:         { type: String, required: true },
  college:      { type: String, required: true },
  department:   { type: String, required: true },
  status:       { type: String, enum: ["active", "paused", "completed", "planned", "under_review", "rejected",  "extended", "terminated"], default: "active" },
  startDate:    { type: String, required: true },
  endDate:      { type: String },
  fundingETB:   { type: Number, default: 0 },
  currency:     { type: String, default: "ETB" }, 
  terminationReason: { type: String, default: "" }, 
  dmpUrl:       { type: String, default: "" }, 
  consentFormUrl: { type: String, default: "" }, 
  disbursementSchedule: [{
    amount: Number,
    date: Date,
    status: { type: String, enum: ['scheduled', 'received'], default: 'scheduled' }
  }],
  fundingSource:{ type: String, default: "ASTU Internal" },
  tags:         [String],
  summary:      { type: String },
  publications: { type: Number, default: 0 },
  teamSize:     { type: Number, default: 1 },
  externalLink: { type: String, default: "" },
  centerOfExcellence: { type: String, default: "None" },
  attachments:  [{ 
    filename: { type: String },
    originalName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    uploadDate: { type: Date, default: Date.now }
  }],
  outputs: [{
    type: { type: String, enum: ['Publication', 'Patent', 'Grant'], default: 'Publication' },
    title: { type: String, trim: true },
    url: { type: String },
    doi: { type: String }
  }],
  // Ownership & Collaboration Fields
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdByName:{ type: String, default: "" },
  // Existing collaborators array (keeps priority info)
  collaborators:[{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" }
  }],
  // New: explicit PI and assignment fields for RBAC
  pi:           { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Principal Investigator user id
  reviewers:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Assigned reviewers
  funder:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Funder / sponsor user id
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastModifiedByName: { type: String, default: "" },
  
  // Ethics & Compliance (IRB) Fields
  ethicsApprovalNumber: { type: String, trim: true, default: "" },
  ethicsApprovalDate: { type: Date, default: null },
  ethicsExpiryDate: { type: Date, default: null },
  ethicsStatus: { 
    type: String, 
    enum: ["not_required", "pending", "approved", "expired", "rejected"], 
    default: "not_required" 
  },
  irbInstitution: { type: String, trim: true, default: "" },
  ethicsNotes: { type: String, default: "" },
  
  // Financial Lock (when ethics expired or budget exceeded)
  financialLock: {
    isLocked: { type: Boolean, default: false },
    reason: { type: String, enum: ["", "ethics_expired", "budget_exceeded", "manual_lock"], default: "" },
    lockedDate: { type: Date, default: null },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lockedByName: { type: String, default: "" }
  }
}, { timestamps: true });

module.exports = mongoose.model("Research", researchSchema);