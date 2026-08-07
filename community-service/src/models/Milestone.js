const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  title: {
    type: String,
    required: true,
    enum: ['First Quarter Report', 'Mid-term Review', 'Final Lab Test', 'Phase 1 Completion', 'Phase 2 Completion', 'Documentation', 'Review Meeting', 'Other']
  },
  customTitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  completionDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    default: ''
  },
  
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone'
  }],
  resourcesNeeded: {
    type: String,
    default: ''
  },
  deliverableType: { 
  type: String, 
  enum: ["progress_report", "ethics_renewal", "financial_report", "publication", "other"] 
},
reviewStatus: { 
  type: String, 
  enum: ["pending", "submitted", "late", "approved", "revision_requested"], 
  default: "pending" 
},
submissions: [{
  version: Number,
  fileUrl: String,
  submittedAt: Date,
  comments: String
}],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  escalated: {
    type: Boolean,
    default: false
  },
  escalatedDate: {
    type: Date,
    default: null
  },
  lastAlertSent: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

MilestoneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-update status based on due date
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  
  next();
});

module.exports = mongoose.model('Milestone', MilestoneSchema);