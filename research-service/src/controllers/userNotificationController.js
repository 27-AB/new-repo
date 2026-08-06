const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;
    
    const query = { userId: new mongoose.Types.ObjectId(userId) };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Notification.countDocuments(query);
    const unread = await Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId), isRead: false });
    
    res.json({
      notifications,
      total,
      unreadCount: unread,
      hasMore: total > (parseInt(skip) + notifications.length)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const count = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false
    });
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error.message);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({ 
      message: 'All notifications marked as read', 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all as read:', error.message);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error.message);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Delete all user notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await Notification.deleteMany({ 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    res.json({ 
      message: 'All notifications deleted', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error.message);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
};
