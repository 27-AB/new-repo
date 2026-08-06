const Timeline = require("../models/Timeline");

// Get timeline items for any entity
exports.getEntityTimeline = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { status, priority, category } = req.query;
    
    const query = { entityType, entityId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    const timelineItems = await Timeline.find(query)
      .sort({ order: 1, plannedStart: 1 })
      .populate('dependencies', 'title status plannedEnd');
      // User population removed - not needed
    
    // Calculate summary statistics
    const summary = {
      total: timelineItems.length,
      completed: timelineItems.filter(t => t.status === 'completed').length,
      inProgress: timelineItems.filter(t => t.status === 'in_progress').length,
      delayed: timelineItems.filter(t => t.status === 'delayed').length,
      notStarted: timelineItems.filter(t => t.status === 'not_started').length,
      averageCompletion: timelineItems.length > 0 
        ? Math.round(timelineItems.reduce((sum, t) => sum + t.completionPercentage, 0) / timelineItems.length)
        : 0,
      totalDelay: timelineItems.reduce((sum, t) => sum + (t.daysDelayed || 0), 0)
    };
    
    res.json({ success: true, timelineItems, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create timeline item
exports.createTimelineItem = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const timelineData = {
      ...req.body,
      entityType,
      entityId,
      createdBy: req.user.id,
      createdByName: req.user.name,
      updatedBy: req.user.id,
      updatedByName: req.user.name
    };
    
    const timelineItem = await Timeline.create(timelineData);
    
    res.status(201).json({ success: true, timelineItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update timeline item
exports.updateTimelineItem = async (req, res) => {
  try {
    const timelineItem = await Timeline.findById(req.params.id);
    if (!timelineItem) {
      return res.status(404).json({ success: false, message: "Timeline item not found" });
    }
    
    const updatedItem = await Timeline.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user.id,
        updatedByName: req.user.name
      },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, timelineItem: updatedItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete timeline item
exports.deleteTimelineItem = async (req, res) => {
  try {
    const timelineItem = await Timeline.findById(req.params.id);
    if (!timelineItem) {
      return res.status(404).json({ success: false, message: "Timeline item not found" });
    }
    
    await Timeline.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: "Timeline item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get timeline analytics for entity
exports.getEntityTimelineAnalytics = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const timelineItems = await Timeline.find({ entityType, entityId });
    
    const analytics = {
      total: timelineItems.length,
      byStatus: {},
      byPriority: {},
      completed: 0,
      inProgress: 0,
      delayed: 0,
      notStarted: 0,
      averageCompletion: 0,
      totalDelay: 0,
      onTime: 0,
      overallProgress: 0
    };
    
    timelineItems.forEach(item => {
      // By status
      analytics.byStatus[item.status] = (analytics.byStatus[item.status] || 0) + 1;
      
      // By priority
      analytics.byPriority[item.priority] = (analytics.byPriority[item.priority] || 0) + 1;
      
      // Status counts
      if (item.status === 'completed') analytics.completed++;
      else if (item.status === 'in_progress') analytics.inProgress++;
      else if (item.status === 'delayed') analytics.delayed++;
      else analytics.notStarted++;
      
      // Completion
      analytics.averageCompletion += item.completionPercentage;
      
      // Delay
      analytics.totalDelay += (item.daysDelayed || 0);
      
      // On time
      if ((item.daysDelayed || 0) <= 0) analytics.onTime++;
    });
    
    if (timelineItems.length > 0) {
      analytics.averageCompletion = Math.round(analytics.averageCompletion / timelineItems.length);
      analytics.overallProgress = analytics.averageCompletion;
    }
    
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Bulk update timeline item order
exports.updateTimelineOrder = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "items must be an array" });
    }
    
    const updatePromises = items.map(({ id, order }) =>
      Timeline.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    const updatedItems = await Promise.all(updatePromises);
    
    res.json({ success: true, timelineItems: updatedItems });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all timeline items for a user (across all entities)
exports.getUserTimeline = async (req, res) => {
  try {
    const { entityType } = req.query;
    
    // Note: req.user not available without auth middleware
    const query = {};
    if (entityType) query.entityType = entityType;
    
    const timelineItems = await Timeline.find(query)
      .sort({ plannedStart: -1 })
      .limit(50)
      .populate('dependencies', 'title status');
    
    res.json({ success: true, timelineItems, count: timelineItems.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get ALL timeline items across all entities
exports.getAllTimelines = async (req, res) => {
  try {
    const { entityType, status, limit = 200 } = req.query;
    const query = {};
    if (entityType) query.entityType = entityType;
    if (status) query.status = status;

    const timelineItems = await Timeline.find(query)
      .sort({ plannedStart: 1 })
      .limit(Number(limit))
      .populate('dependencies', 'title status plannedEnd');
      // User population removed

    const summary = {
      total: timelineItems.length,
      completed: timelineItems.filter(t => t.status === 'completed').length,
      inProgress: timelineItems.filter(t => t.status === 'in_progress').length,
      delayed: timelineItems.filter(t => t.status === 'delayed').length,
      notStarted: timelineItems.filter(t => t.status === 'not_started').length,
      averageCompletion: timelineItems.length > 0
        ? Math.round(timelineItems.reduce((s, t) => s + t.completionPercentage, 0) / timelineItems.length)
        : 0,
    };

    res.json({ success: true, timelineItems, summary, count: timelineItems.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get timeline stats aggregated
exports.getTimelineStats = async (req, res) => {
  try {
    const [byStatus, byPriority, byEntityType] = await Promise.all([
      Timeline.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Timeline.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Timeline.aggregate([{ $group: { _id: '$entityType', count: { $sum: 1 } } }]),
    ]);

    const toMap = (arr) => arr.reduce((m, { _id, count }) => { m[_id] = count; return m; }, {});

    res.json({
      success: true,
      stats: {
        total: await Timeline.countDocuments(),
        byStatus: toMap(byStatus),
        byPriority: toMap(byPriority),
        byEntityType: toMap(byEntityType),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};