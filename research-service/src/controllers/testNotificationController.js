const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Send test notification to ALL users with notification emails
exports.sendTestNotificationToAll = async (req, res) => {
  try {
    console.log('📧 Sending test notification to all users with notification emails...');
    
    const User = mongoose.connection.db.collection('users');
    
    // Find all users with notificationEmail set
    const users = await User.find({
      role: { $in: ['admin', 'researcher'] },
      receiveNotifications: true,
      notificationEmail: { $exists: true, $ne: '' }
    }).toArray();
    
    console.log(`Found ${users.length} users with notification emails set`);
    
    if (users.length === 0) {
      return res.json({
        success: false,
        message: 'No users found with notification emails set. Please run /auth/seed-emails first.'
      });
    }
    
    let emailsSent = 0;
    let notificationsCreated = 0;
    
    for (const user of users) {
      console.log(`Processing user: ${user.name} -> ${user.notificationEmail || user.email}`);
      
      // Save notification to database
      const notification = new Notification({
        userId: user._id,
        userName: user.name,
        userEmail: user.notificationEmail || user.email,
        type: 'test',
        priority: 'low',
        title: 'Test Notification',
        message: `This is a test notification for ${user.name}. If you receive this, your email configuration is working!`,
        isRead: false,
        emailSent: false
      });
      
      await notification.save();
      notificationsCreated++;
      
      // For now, just log - don't actually send (requires real email config)
      console.log(`✓ Notification created for ${user.name}`);
    }
    
    res.json({
      success: true,
      message: 'Test notifications created!',
      stats: {
        totalUsers: users.length,
        notificationsCreated,
        emailSent: emailsSent
      }
    });
  } catch (error) {
    console.error('Error sending test notification:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create test notifications',
      details: error.message
    });
  }
};
