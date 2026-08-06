const Expenditure = require('../models/Expenditure');
const Research = require('../models/Research');

// Create a new expenditure
exports.createExpenditure = async (req, res) => {
  try {
    const { 
      projectId, description, amount, category, date, 
      receiptNumber, vendor, notes, submittedByName 
    } = req.body;
    
    // Verify project exists
    const project = await Research.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Research project not found' 
      });
    }
    
    // Check if project is financially locked
    if (project.financialLock?.isLocked) {
      return res.status(403).json({ 
        success: false, 
        message: `Project is financially locked. Reason: ${project.financialLock.reason}`,
        lockReason: project.financialLock.reason
      });
    }
    
    const expenditure = new Expenditure({
      projectId,
      description,
      amount,
      category,
      date: date || Date.now(),
      receiptNumber,
      vendor,
      notes,
      submittedBy: req.user?._id,
      submittedByName: submittedByName || req.user?.name || 'Unknown'
    });
    
    await expenditure.save();
    
    // Check if expenditure causes budget to be exceeded
    await checkBudgetStatus(projectId);
    
    res.status(201).json({ 
      success: true, 
      expenditure 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all expenditures for a project
exports.getProjectExpenditures = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, category, startDate, endDate } = req.query;
    
    const query = { projectId };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const expenditures = await Expenditure.find(query).sort({ date: -1 });
    
    // Calculate summary
    const summary = await calculateExpenditureSummary(projectId);
    
    res.json({ 
      success: true, 
      expenditures,
      summary 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get expenditure summary for a project
exports.getExpenditureSummary = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const summary = await calculateExpenditureSummary(projectId);
    
    res.json({ 
      success: true, 
      summary 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update expenditure
exports.updateExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const expenditure = await Expenditure.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!expenditure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expenditure not found' 
      });
    }
    
    // Recheck budget status after update
    await checkBudgetStatus(expenditure.projectId);
    
    res.json({ 
      success: true, 
      expenditure 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete expenditure
exports.deleteExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expenditure = await Expenditure.findByIdAndDelete(id);
    
    if (!expenditure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expenditure not found' 
      });
    }
    
    // Recheck budget status after deletion
    await checkBudgetStatus(expenditure.projectId);
    
    res.json({ 
      success: true, 
      message: 'Expenditure deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Approve expenditure (admin only)
exports.approveExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expenditure = await Expenditure.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy: req.user?._id,
        approvedByName: req.user?.name || 'Admin',
        approvalDate: new Date()
      },
      { new: true }
    );
    
    if (!expenditure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expenditure not found' 
      });
    }
    
    res.json({ 
      success: true, 
      expenditure 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Reject expenditure (admin only)
exports.rejectExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const expenditure = await Expenditure.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectionReason: reason,
        approvedBy: req.user?._id,
        approvedByName: req.user?.name || 'Admin',
        approvalDate: new Date()
      },
      { new: true }
    );
    
    if (!expenditure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expenditure not found' 
      });
    }
    
    res.json({ 
      success: true, 
      expenditure 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get expenditures by category (for charts)
exports.getExpendituresByCategory = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const categoryBreakdown = await Expenditure.aggregate([
      { $match: { projectId: mongoose.Types.ObjectId(projectId), status: 'approved' } },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { total: -1 } }
    ]);
    
    res.json({ 
      success: true, 
      categoryBreakdown 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Helper: Calculate expenditure summary
async function calculateExpenditureSummary(projectId) {
  const project = await Research.findById(projectId);
  if (!project) throw new Error('Project not found');
  
  const budget = project.fundingETB || 0;
  
  // Get all approved expenditures
  const approvedExpenditures = await Expenditure.find({ 
    projectId, 
    status: 'approved' 
  });
  
  const totalSpent = approvedExpenditures.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Get pending expenditures
  const pendingExpenditures = await Expenditure.find({ 
    projectId, 
    status: 'pending' 
  });
  
  const totalPending = pendingExpenditures.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate metrics
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const projectedTotal = totalSpent + totalPending;
  const isOverBudget = totalSpent > budget;
  const willExceedBudget = projectedTotal > budget;
  
  return {
    budget,
    totalSpent,
    totalPending,
    remaining,
    percentUsed: Math.round(percentUsed * 100) / 100,
    projectedTotal,
    isOverBudget,
    willExceedBudget,
    approvedCount: approvedExpenditures.length,
    pendingCount: pendingExpenditures.length
  };
}

// Helper: Check budget status and lock if needed
async function checkBudgetStatus(projectId) {
  try {
    const summary = await calculateExpenditureSummary(projectId);
    const project = await Research.findById(projectId);
    
    if (!project) return;
    
    // Lock if over budget
    if (summary.isOverBudget && !project.financialLock?.isLocked) {
      project.financialLock = {
        isLocked: true,
        reason: 'budget_exceeded',
        lockedDate: new Date(),
        lockedByName: 'System (Auto-lock)'
      };
      await project.save();
    }
    
    // Unlock if back under budget
    if (!summary.isOverBudget && 
        project.financialLock?.isLocked && 
        project.financialLock?.reason === 'budget_exceeded') {
      project.financialLock = {
        isLocked: false,
        reason: '',
        lockedDate: null,
        lockedByName: ''
      };
      await project.save();
    }
  } catch (error) {
    console.error('Error checking budget status:', error);
  }
}

module.exports.checkBudgetStatus = checkBudgetStatus;
