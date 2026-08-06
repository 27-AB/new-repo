const {
  sendTestEmail,
  checkUpcomingDeadlines,
  checkOverdueMilestones,
  checkExpiringEthics,
  emailTemplates,
  sendEmail
} = require('../services/notificationService');

// Send test email
exports.sendTest = async (req, res) => {
  try {
    const { email } = req.body;
    const to = email || process.env.ALERT_EMAIL || 'abrahamgebreyohannes12@gmail.com';
    
    const result = await sendTestEmail(to);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Manually trigger deadline check
exports.checkDeadlines = async (req, res) => {
  try {
    const result = await checkUpcomingDeadlines();
    res.json({
      success: true,
      message: 'Deadline check completed',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Manually trigger overdue check
exports.checkOverdue = async (req, res) => {
  try {
    const result = await checkOverdueMilestones();
    res.json({
      success: true,
      message: 'Overdue check completed',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Manually trigger ethics check
exports.checkEthics = async (req, res) => {
  try {
    const result = await checkExpiringEthics();
    res.json({
      success: true,
      message: 'Ethics check completed',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Run all checks at once
exports.runAllChecks = async (req, res) => {
  try {
    console.log('🔍 Running all notification checks...');
    
    const deadlines = await checkUpcomingDeadlines();
    const overdue = await checkOverdueMilestones();
    const ethics = await checkExpiringEthics();
    
    res.json({
      success: true,
      message: 'All checks completed',
      results: {
        deadlines,
        overdue,
        ethics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notification settings
exports.getSettings = async (req, res) => {
  try {
    res.json({
      success: true,
      settings: {
        emailEnabled: !!process.env.EMAIL_USER,
        alertEmail: process.env.ALERT_EMAIL || 'abrahamgebreyohannes12@gmail.com',
        schedules: {
          deadlineCheck: '9:00 AM daily',
          overdueCheck: '10:00 AM daily',
          ethicsCheck: '8:00 AM daily'
        },
        alerts: {
          deadlineWarning: '7 days before due date',
          escalationThreshold: '14 days overdue',
          ethicsWarning: '30, 14, 7, 3 days before expiry'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send custom notification
exports.sendCustom = async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }
    
    const template = {
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; border-radius: 8px; padding: 30px; border-top: 4px solid #22d3ee;">
            <h2 style="color: #22d3ee; margin-top: 0;">📧 Custom Notification</h2>
            <div style="color: #333; line-height: 1.6;">${message}</div>
            <div style="margin-top: 30px; text-align: center;">
              <a href="http://localhost:3001" 
                 style="display: inline-block; background: #22d3ee; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Dashboard
              </a>
            </div>
          </div>
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            ASTU Analytics - Notification System
          </p>
        </div>
      `
    };
    
    const result = await sendEmail(to, template);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Custom notification sent to ${to}`,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
