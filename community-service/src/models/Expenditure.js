const mongoose = require("mongoose");

const expenditureSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
    index: true
  },
  
  // Expenditure Details
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  category: {
    type: String,
    enum: [
      "Equipment",
      "Personnel",
      "Materials",
      "Travel",
      "Software",
      "Services",
      "Overhead",
      "Publication",
      "Training",
      "Other"
    ],
    default: "Other"
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Receipt/Invoice Information
  receiptNumber: {
    type: String,
    trim: true
  },
  
  vendor: {
    type: String,
    trim: true
  },
  
  // Approval Status
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  
  // Approval Details
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  approvedByName: {
    type: String
  },
  
  approvalDate: {
    type: Date
  },
  
  rejectionReason: {
    type: String
  },
  
  // Tracking
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  submittedByName: {
    type: String,
    required: true
  },
  
  notes: {
    type: String
  },
  
  // Attachments (receipts, invoices)
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }]
  
}, { timestamps: true });

// Index for faster queries
expenditureSchema.index({ projectId: 1, date: -1 });
expenditureSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model("CommunityExpenditure", expenditureSchema);
