const Milestone = require('../models/Milestone');
const College = require('../models/College');

// Create a new milestone
exports.createMilestone = async (req, res) => {
  try {
    const { projectId, title, customTitle, description, dueDate, priority, assignedTo, dependencies, resourcesNeeded } = req.body;
    
    // Verify project exists
    const project = await College.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'College not found' });
    }
    
    const milestone = new Milestone({
      projectId,
      title,
      customTitle,
      description,
      dueDate,
      priority,
      assignedTo,
      dependencies,
      resourcesNeeded
    });
    
    await milestone.save();
    res.status(201).json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all milestones for a project
exports.getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestones = await Milestone.find({ projectId })
      .populate('dependencies')
      .sort({ dueDate: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single milestone
exports.getMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('dependencies');
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a milestone
exports.updateMilestone = async (req, res) => {
  try {
    const { title, customTitle, description, dueDate, status, completionDate, priority, assignedTo, dependencies, resourcesNeeded, progress } = req.body;
    
    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { title, customTitle, description, dueDate, status, completionDate, priority, assignedTo, dependencies, resourcesNeeded, progress },
      { new: true, runValidators: true }
    );
    
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a milestone
exports.deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndDelete(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all milestones across all projects
exports.getAllMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find()
      .populate('projectId')
      .populate('dependencies')
      .sort({ dueDate: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get overdue milestones
exports.getOverdueMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ 
      status: 'overdue',
      dueDate: { $lt: new Date() }
    })
      .populate('projectId')
      .sort({ dueDate: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming milestones (next 30 days)
exports.getUpcomingMilestones = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const milestones = await Milestone.find({
      dueDate: { $gte: new Date(), $lte: thirtyDaysFromNow },
      status: { $in: ['pending', 'in-progress'] }
    })
      .populate('projectId')
      .sort({ dueDate: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get milestones by status
exports.getMilestonesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const milestones = await Milestone.find({ status })
      .populate('projectId')
      .sort({ dueDate: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete a milestone
exports.completeMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        completionDate: new Date(),
        progress: 100
      },
      { new: true }
    );
    
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get milestone statistics
exports.getMilestoneStats = async (req, res) => {
  try {
    const stats = await Milestone.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const formattedStats = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      overdue: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });
    
    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};