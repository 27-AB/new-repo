const User = require('../models/User');

// Update user's notification email
exports.updateNotificationEmail = async (req, res) => {
  try {
    const { notificationEmail, receiveNotifications } = req.body;
    const userId = req.user.id; // From auth middleware
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Validate email format
    if (notificationEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(notificationEmail)) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
      }
      user.notificationEmail = notificationEmail;
    }
    
    if (receiveNotifications !== undefined) {
      user.receiveNotifications = receiveNotifications;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Notification settings updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        notificationEmail: user.notificationEmail,
        receiveNotifications: user.receiveNotifications
      }
    });
  } catch (error) {
    console.error('Error updating notification email:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update notification settings', 
      details: error.message 
    });
  }
};

// Get user's notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId, 'name email notificationEmail receiveNotifications');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      settings: {
        name: user.name,
        email: user.email,
        notificationEmail: user.notificationEmail || '',
        receiveNotifications: user.receiveNotifications,
        hasNotificationEmail: !!user.notificationEmail
      }
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notification settings', 
      details: error.message 
    });
  }
};

// Verify notification email (send verification code)
exports.sendVerificationEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!user.notificationEmail) {
      return res.status(400).json({ success: false, error: 'No notification email set' });
    }
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code temporarily (in production, use Redis or database)
    // For now, we'll just send the email
    
    // TODO: Send verification email with code
    // For now, return success
    
    res.json({
      success: true,
      message: 'Verification email sent (feature coming soon)',
      email: user.notificationEmail
    });
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification email', 
      details: error.message 
    });
  }
};
