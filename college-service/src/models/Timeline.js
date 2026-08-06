const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
  // Entity this timeline belongs to
  entityType: {
    type: String,
    enum: ["research", "community", "college"],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  // Timeline details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  
  // Date tracking
  plannedStart: {
    type: Date,
    required: true
  },
  plannedEnd: {
    type: Date,
    required: true
  },
  actualStart: {
    type: Date,
    default: null
  },
  actualEnd: {
    type: Date,
    default: null
  },
  
  // Status and progress
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed", "delayed", "on_hold", "cancelled"],
    default: "not_started"
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  priority: {
    type: String,
    enum: ["critical", "high", "medium", "low"],
    default: "medium"
  },
  
  // Dependencies
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Timeline"
  }],
  
  // Milestone references
  milestones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Milestone"
  }],
  
  // Metadata
  order: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: "general"
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  createdByName: {
    type: String,
    default: ""
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  updatedByName: {
    type: String,
    default: ""
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
timelineSchema.index({ entityType: 1, entityId: 1 });
timelineSchema.index({ entityType: 1, status: 1 });
timelineSchema.index({ plannedEnd: 1 });

// Virtual fields
timelineSchema.virtual('plannedDuration').get(function() {
  if (this.plannedStart && this.plannedEnd) {
    return Math.ceil((this.plannedEnd - this.plannedStart) / (1000 * 60 * 60 * 24));
  }
  return null;
});

timelineSchema.virtual('actualDuration').get(function() {
  if (this.actualStart && this.actualEnd) {
    return Math.ceil((this.actualEnd - this.actualStart) / (1000 * 60 * 60 * 24));
  }
  return null;
});

timelineSchema.virtual('daysRemaining').get(function() {
  if (this.plannedEnd && this.status !== 'completed') {
    const now = new Date();
    return Math.ceil((this.plannedEnd - now) / (1000 * 60 * 60 * 24));
  }
  return null;
});

timelineSchema.virtual('daysDelayed').get(function() {
  const now = new Date();
  if (this.actualStart && this.status === 'in_progress') {
    if (now > this.plannedEnd) {
      return Math.ceil((now - this.plannedEnd) / (1000 * 60 * 60 * 24));
    }
  } else if (this.actualEnd && this.plannedEnd) {
    return Math.ceil((this.actualEnd - this.plannedEnd) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Pre-save middleware to update computed fields
timelineSchema.pre('save', function(next) {
  const now = new Date();
  
  // Calculate days remaining
  if (this.plannedEnd && this.status !== 'completed') {
    this.daysRemaining = Math.ceil((this.plannedEnd - now) / (1000 * 60 * 60 * 24));
  } else {
    this.daysRemaining = null;
  }
  
  // Calculate days delayed
  if (this.actualStart && this.status === 'in_progress') {
    if (now > this.plannedEnd) {
      this.daysDelayed = Math.ceil((now - this.plannedEnd) / (1000 * 60 * 60 * 24));
    } else {
      this.daysDelayed = 0;
    }
  } else if (this.actualEnd && this.plannedEnd) {
    this.daysDelayed = Math.ceil((this.actualEnd - this.plannedEnd) / (1000 * 60 * 60 * 24));
  }
  
  next();
});

module.exports = mongoose.model("Timeline", timelineSchema);