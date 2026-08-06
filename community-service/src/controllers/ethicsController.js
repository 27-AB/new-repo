const Community = require('../models/Community');

// Update ethics/compliance information
exports.updateEthicsInfo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      ethicsApprovalNumber, 
      ethicsApprovalDate, 
      ethicsExpiryDate,
      ethicsStatus,
      irbInstitution,
      ethicsNotes
    } = req.body;
    
    const project = await Community.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Community project not found' 
      });
    }
    
    // Update ethics fields
    if (ethicsApprovalNumber !== undefined) project.ethicsApprovalNumber = ethicsApprovalNumber;
    if (ethicsApprovalDate !== undefined) project.ethicsApprovalDate = ethicsApprovalDate;
    if (ethicsExpiryDate !== undefined) project.ethicsExpiryDate = ethicsExpiryDate;
    if (ethicsStatus !== undefined) project.ethicsStatus = ethicsStatus;
    if (irbInstitution !== undefined) project.irbInstitution = irbInstitution;
    if (ethicsNotes !== undefined) project.ethicsNotes = ethicsNotes;
    
    // Check if ethics has expired and lock if needed
    await checkEthicsExpiry(project, req.user);
    
    await project.save();
    
    res.json({ 
      success: true, 
      project,
      message: 'Ethics information updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get ethics status for a project
exports.getEthicsStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Community.findById(projectId).select(
      'ethicsApprovalNumber ethicsApprovalDate ethicsExpiryDate ethicsStatus ' +
      'irbInstitution ethicsNotes financialLock'
    );
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Community project not found' 
      });
    }
    
    // Calculate days until expiry
    let daysUntilExpiry = null;
    let isExpired = false;
    
    if (project.ethicsExpiryDate) {
      const today = new Date();
      const expiryDate = new Date(project.ethicsExpiryDate);
      const diffTime = expiryDate - today;
      daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isExpired = daysUntilExpiry < 0;
    }
    
    res.json({ 
      success: true, 
      ethics: {
        approvalNumber: project.ethicsApprovalNumber,
        approvalDate: project.ethicsApprovalDate,
        expiryDate: project.ethicsExpiryDate,
        status: project.ethicsStatus,
        institution: project.irbInstitution,
        notes: project.ethicsNotes,
        daysUntilExpiry,
        isExpired,
        isLocked: project.financialLock?.isLocked || false,
        lockReason: project.financialLock?.reason || ''
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Check all projects for expired ethics and lock them
exports.checkAllProjectsEthicsExpiry = async (req, res) => {
  try {
    const projects = await Community.find({ 
      ethicsStatus: 'approved',
      ethicsExpiryDate: { $exists: true, $ne: null }
    });
    
    let lockedCount = 0;
    let warningCount = 0;
    
    for (const project of projects) {
      const result = await checkEthicsExpiry(project, req.user);
      if (result.locked) lockedCount++;
      if (result.warning) warningCount++;
    }
    
    res.json({ 
      success: true, 
      message: `Checked ${projects.length} projects`,
      lockedCount,
      warningCount,
      totalChecked: projects.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get projects with expiring ethics approvals (within 30 days)
exports.getExpiringEthicsApprovals = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringProjects = await Community.find({
      ethicsStatus: 'approved',
      ethicsExpiryDate: { 
        $gte: today, 
        $lte: thirtyDaysFromNow 
      }
    }).select('title lead ethicsExpiryDate ethicsApprovalNumber');
    
    // Calculate days until expiry for each
    const projectsWithDays = expiringProjects.map(project => {
      const diffTime = new Date(project.ethicsExpiryDate) - today;
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        _id: project._id,
        title: project.title,
        lead: project.lead,
        ethicsExpiryDate: project.ethicsExpiryDate,
        ethicsApprovalNumber: project.ethicsApprovalNumber,
        daysUntilExpiry
      };
    });
    
    res.json({ 
      success: true, 
      expiringProjects: projectsWithDays,
      count: projectsWithDays.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get projects with expired ethics approvals
exports.getExpiredEthicsApprovals = async (req, res) => {
  try {
    const today = new Date();
    
    const expiredProjects = await Community.find({
      ethicsStatus: 'approved',
      ethicsExpiryDate: { $lt: today }
    }).select('title lead ethicsExpiryDate ethicsApprovalNumber financialLock');
    
    // Calculate days overdue for each
    const projectsWithDays = expiredProjects.map(project => {
      const diffTime = today - new Date(project.ethicsExpiryDate);
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        _id: project._id,
        title: project.title,
        lead: project.lead,
        ethicsExpiryDate: project.ethicsExpiryDate,
        ethicsApprovalNumber: project.ethicsApprovalNumber,
        daysOverdue,
        isLocked: project.financialLock?.isLocked || false
      };
    });
    
    res.json({ 
      success: true, 
      expiredProjects: projectsWithDays,
      count: projectsWithDays.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Manually lock/unlock a project
exports.toggleFinancialLock = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { lock, reason } = req.body; // lock: true/false
    
    const project = await Community.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Community project not found' 
      });
    }
    
    if (lock) {
      project.financialLock = {
        isLocked: true,
        reason: reason || 'manual_lock',
        lockedDate: new Date(),
        lockedBy: req.user?._id,
        lockedByName: req.user?.name || 'Admin'
      };
    } else {
      project.financialLock = {
        isLocked: false,
        reason: '',
        lockedDate: null,
        lockedBy: null,
        lockedByName: ''
      };
    }
    
    await project.save();
    
    res.json({ 
      success: true, 
      project,
      message: lock ? 'Project locked successfully' : 'Project unlocked successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Helper function: Check ethics expiry and lock if needed
async function checkEthicsExpiry(project, user) {
  let locked = false;
  let warning = false;
  
  if (project.ethicsExpiryDate && project.ethicsStatus === 'approved') {
    const today = new Date();
    const expiryDate = new Date(project.ethicsExpiryDate);
    const diffTime = expiryDate - today;
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Expired - lock the project
    if (daysUntilExpiry < 0) {
      if (!project.financialLock?.isLocked || 
          project.financialLock?.reason !== 'ethics_expired') {
        project.ethicsStatus = 'expired';
        project.financialLock = {
          isLocked: true,
          reason: 'ethics_expired',
          lockedDate: new Date(),
          lockedBy: user?._id,
          lockedByName: user?.name || 'System (Auto-lock)'
        };
        locked = true;
      }
    }
    
    // Expiring soon (within 30 days) - warning
    if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
      warning = true;
    }
  }
  
  return { locked, warning };
}

module.exports.checkEthicsExpiry = checkEthicsExpiry;
