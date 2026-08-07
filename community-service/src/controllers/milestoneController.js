const Milestone = require('../models/Milestone');
const Community = require('../models/Community');

// Create a new milestone
exports.createMilestone = async (req, res) => {
  try {
    const { projectId, title, customTitle, description, dueDate, priority, assignedTo, dependencies, resourcesNeeded } = req.body;
    
    // Verify project exists
    const project = await Community.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Community project not found' });
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

// Seed milestones for existing projects
exports.seedMilestones = async (req, res) => {
  try {
    const Community = require('../models/Community');
    
    // Clear existing milestones
    await Milestone.deleteMany({});
    
    // Get all community projects
    const communityProjects = await Community.find({});
    
    // Generate milestones for each project
    for (const project of communityProjects) {
      const startDate = new Date(project.startDate || new Date());
      const endDate = new Date(project.endDate || new Date().setFullYear(new Date().getFullYear() + 1));
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Calculate milestone dates
      const firstQuarter = new Date(startDate);
      firstQuarter.setDate(firstQuarter.getDate() + Math.floor(duration * 0.25));
      
      const midTerm = new Date(startDate);
      midTerm.setDate(midTerm.getDate() + Math.floor(duration * 0.5));
      
      const phase1End = new Date(startDate);
      phase1End.setDate(phase1End.getDate() + Math.floor(duration * 0.6));
      
      const phase2End = new Date(startDate);
      phase2End.setDate(phase2End.getDate() + Math.floor(duration * 0.8));
      
      const finalTest = new Date(endDate);
      finalTest.setDate(finalTest.getDate() - 30);
      
      const milestones = [
        {
          projectId: project._id,
          title: 'First Quarter Report',
          description: 'Initial progress report and findings summary',
          dueDate: firstQuarter,
          status: Math.random() > 0.5 ? 'completed' : 'in-progress',
          priority: 'medium',
          assignedTo: 'Project Lead',
          progress: Math.random() > 0.5 ? 100 : Math.floor(Math.random() * 75) + 25,
          completionDate: Math.random() > 0.5 ? new Date(firstQuarter.getTime() - 7 * 24 * 60 * 60 * 1000) : null
        },
        {
          projectId: project._id,
          title: 'Mid-term Review',
          description: 'Comprehensive review of project progress and adjustments',
          dueDate: midTerm,
          status: Math.random() > 0.7 ? 'in-progress' : 'pending',
          priority: 'high',
          assignedTo: 'Project Team',
          progress: Math.random() > 0.7 ? Math.floor(Math.random() * 50) : 0,
          completionDate: null
        },
        {
          projectId: project._id,
          title: 'Phase 1 Completion',
          description: 'Completion of first major phase with deliverables',
          dueDate: phase1End,
          status: Math.random() > 0.8 ? 'completed' : 'in-progress',
          priority: 'high',
          assignedTo: 'Project Lead',
          progress: Math.random() > 0.8 ? 100 : Math.floor(Math.random() * 60) + 40,
          completionDate: Math.random() > 0.8 ? new Date(phase1End.getTime() - 5 * 24 * 60 * 60 * 1000) : null
        },
        {
          projectId: project._id,
          title: 'Phase 2 Completion',
          description: 'Completion of second major phase with testing',
          dueDate: phase2End,
          status: Math.random() > 0.9 ? 'in-progress' : 'pending',
          priority: 'high',
          assignedTo: 'Technical Team',
          progress: Math.random() > 0.9 ? Math.floor(Math.random() * 30) : 0,
          completionDate: null
        },
        {
          projectId: project._id,
          title: 'Final Lab Test',
          description: 'Final laboratory testing and validation',
          dueDate: finalTest,
          status: 'pending',
          priority: 'critical',
          assignedTo: 'Quality Assurance',
          progress: 0,
          completionDate: null
        },
        {
          projectId: project._id,
          title: 'Documentation',
          description: 'Final documentation and reporting',
          dueDate: endDate,
          status: 'pending',
          priority: 'medium',
          assignedTo: 'Project Lead',
          progress: 0,
          completionDate: null
        }
      ];
      
      await Milestone.insertMany(milestones);
    }
    
    const totalMilestones = await Milestone.countDocuments();
    res.json({ 
      message: `Successfully seeded ${totalMilestones} milestones for ${communityProjects.length} community projects`,
      totalMilestones,
      projectsCount: communityProjects.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Add this at the end of milestoneController.js in research-service
exports.requestRevision = async (req, res) => {
  try {
    const { id } = req.params; // We get the ID from the URL
    const { comment } = req.body;

    const milestone = await Milestone.findByIdAndUpdate(
      id,
      {
        reviewStatus: "revision_requested",
        // This adds the admin's comment to the milestone's general description 
        // or a specific comments field if you prefer.
        $push: { "submissions.0.comments": comment } 
      },
      { new: true }
    );

    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    res.json({ 
      success: true, 
      message: "Revision requested. Researcher will be notified.",
      milestone 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.submitMilestoneReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl, notes } = req.body;

    const milestone = await Milestone.findById(id);
    
    // Increment version based on existing submissions
    const nextVersion = (milestone.submissions?.length || 0) + 1;

    const updatedMilestone = await Milestone.findByIdAndUpdate(
      id,
      {
        reviewStatus: "submitted",
        status: "in-progress",
        $push: { 
          submissions: { 
            version: nextVersion, 
            fileUrl: fileUrl, 
            comments: notes,
            submittedAt: new Date() 
          } 
        }
      },
      { new: true }
    );

    res.json({ success: true, message: "Report submitted for review", milestone: updatedMilestone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
