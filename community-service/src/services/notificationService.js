const nodemailer = require('nodemailer');
const Community = require('../models/Community');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Get all researchers who want to receive notifications
const getAllNotificationRecipients = async () => {
  try {
    const User = mongoose.connection.db.collection('users');
    const users = await User.find({
      role: { $in: ['admin', 'researcher'] },
      receiveNotifications: true,
      notificationEmail: { $exists: true, $ne: '' }
    }).toArray();
    
    return users.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.notificationEmail || user.email
    }));
  } catch (error) {
    console.error('Error fetching notification recipients:', error.message);
    return [];
  }
};

// Get researcher user info (from User collection)
const getResearcherUser = async (projectLeadName) => {
  try {
    // Connect to auth database to get user email
    const User = mongoose.connection.db.collection('users');
    const user = await User.findOne({ 
      name: new RegExp(`^${projectLeadName}$`, 'i') 
    });
    
    if (user) {
      // Only return if user has set notification email and wants notifications
      if (user.receiveNotifications && (user.notificationEmail || user.email)) {
        return {
          userId: user._id,
          name: user.name,
          email: user.notificationEmail || user.email
        };
      }
    }
    
    return null; // No valid email or notifications disabled
  } catch (error) {
    console.error('Error fetching researcher user:', error.message);
    return null;
  }
};

// Save notification to database
const saveNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    console.log(`💾 Notification saved to database for ${notificationData.userName}`);
    return notification;
  } catch (error) {
    console.error('❌ Error saving notification:', error.message);
    return null;
  }
};

// Email transporter configuration
const createTransporter = () => {
  // Using Gmail SMTP (you can change to any email service)
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Check if email credentials are configured
const isEmailConfigured = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  return user && pass && 
         !user.includes('your-email') && 
         !pass.includes('your-app-password');
};

// Email templates
const emailTemplates = {
  deadlineWarning: (project, milestone, daysUntil) => ({
    subject: `🚨 Deadline Alert: ${project.title} - ${daysUntil} days remaining`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 30px; border-top: 4px solid #f59e0b;">
          <h2 style="color: #f59e0b; margin-top: 0;">⏰ Deadline Approaching</h2>
          
          <div style="background: #fff3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>Project:</strong> ${project.title}<br>
            <strong>${milestone ? 'Milestone' : 'Project Deadline'}:</strong> ${milestone?.title || 'Project End Date'}<br>
            <strong>Due Date:</strong> ${new Date(milestone?.dueDate || project.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}<br>
            <strong>Days Remaining:</strong> <span style="color: #f59e0b; font-size: 18px; font-weight: bold;">${daysUntil} days</span>
          </div>
          
          <p style="color: #333;">This is an automated reminder that the above deadline is approaching soon. Please ensure all tasks are on track.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>Project Lead:</strong> ${project.lead}<br>
              <strong>Status:</strong> ${project.status}
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="http://localhost:3001/community" 
               style="display: inline-block; background: #22d3ee; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Project Dashboard
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          ASTU Analytics - Automated Notification System
        </p>
      </div>
    `
  }),

  milestoneOverdue: (project, milestone, daysOverdue) => ({
    subject: `🚨 URGENT: Milestone Overdue - ${project.title} (${daysOverdue} days late)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 30px; border-top: 4px solid #ef4444;">
          <h2 style="color: #ef4444; margin-top: 0;">🚨 MILESTONE OVERDUE</h2>
          
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <strong>Project:</strong> ${project.title}<br>
            <strong>Milestone:</strong> ${milestone.title}<br>
            <strong>Due Date:</strong> ${new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}<br>
            <strong>Days Overdue:</strong> <span style="color: #ef4444; font-size: 18px; font-weight: bold;">${daysOverdue} days</span><br>
            <strong>Status:</strong> ${milestone.status}
          </div>
          
          <p style="color: #333;">This milestone is significantly overdue. Immediate action is required to get the project back on track.</p>
          
          ${daysOverdue > 14 ? `
          <div style="background: #fecaca; border: 2px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 6px;">
            <strong style="color: #991b1b;">⚠️ ESCALATION NOTICE</strong><br>
            <span style="color: #333;">This milestone is ${daysOverdue} days overdue. Department Head has been notified.</span>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>Project Lead:</strong> ${project.lead}<br>
              <strong>Project Status:</strong> ${project.status}
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="http://localhost:3001/community" 
               style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Update Milestone Status
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          ASTU Analytics - Automated Notification System
        </p>
      </div>
    `
  }),

  escalationAlert: (project, milestone, daysOverdue, departmentHead) => ({
    subject: `🚨 ESCALATION: ${project.title} - Milestone ${daysOverdue} days overdue`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 30px; border-top: 4px solid #991b1b;">
          <h2 style="color: #991b1b; margin-top: 0;">🚨 DEPARTMENT HEAD ESCALATION</h2>
          
          <p style="color: #333; font-size: 16px;">Dear ${departmentHead || 'Department Head'},</p>
          
          <p style="color: #333;">This is an automated escalation notice for a significantly overdue milestone that requires your attention.</p>
          
          <div style="background: #fee2e2; border-left: 4px solid #991b1b; padding: 15px; margin: 20px 0;">
            <strong>Project:</strong> ${project.title}<br>
            <strong>College:</strong> ${project.college}<br>
            <strong>Project Lead:</strong> ${project.lead}<br>
            <strong>Milestone:</strong> ${milestone.title}<br>
            <strong>Original Due Date:</strong> ${new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}<br>
            <strong>Days Overdue:</strong> <span style="color: #991b1b; font-size: 20px; font-weight: bold;">${daysOverdue} days</span><br>
            <strong>Current Status:</strong> ${milestone.status}
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>📊 Project Overview:</strong><br>
            Status: ${project.status}<br>
            Start Date: ${new Date(project.startDate).toLocaleDateString()}<br>
            Expected End: ${new Date(project.endDate).toLocaleDateString()}<br>
            ${project.budgetETB ? `Budget: ${project.budgetETB.toLocaleString()} ETB` : ''}
          </div>
          
          <p style="color: #333;"><strong>Action Required:</strong> Please review this project and coordinate with the project lead to address the delays.</p>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="http://localhost:3001/community" 
               style="display: inline-block; background: #991b1b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Project Details
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          ASTU Analytics - Automated Notification System<br>
          This is an automated escalation triggered by system policy (14+ days overdue)
        </p>
      </div>
    `
  }),

  ethicsExpiring: (project, daysUntil) => ({
    subject: `🛡️ Ethics Approval Expiring Soon: ${project.title} - ${daysUntil} days remaining`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 30px; border-top: 4px solid #f59e0b;">
          <h2 style="color: #f59e0b; margin-top: 0;">🛡️ Ethics Approval Expiring</h2>
          
          <div style="background: #fff3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <strong>Project:</strong> ${project.title}<br>
            <strong>Ethics Approval Number:</strong> ${project.ethicsApprovalNumber}<br>
            <strong>Expiry Date:</strong> ${new Date(project.ethicsExpiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}<br>
            <strong>Days Remaining:</strong> <span style="color: #f59e0b; font-size: 18px; font-weight: bold;">${daysUntil} days</span>
          </div>
          
          <p style="color: #333;">Your ethics approval is expiring soon. Please begin the renewal process immediately to avoid project disruption.</p>
          
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <strong>⚠️ Important:</strong> If ethics approval expires, the project will be automatically locked and all activities must cease until renewal is approved.
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>Project Lead:</strong> ${project.lead}<br>
              <strong>IRB Institution:</strong> ${project.irbInstitution || 'N/A'}
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="http://localhost:3001/community" 
               style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Update Ethics Information
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          ASTU Analytics - Automated Notification System
        </p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template) => {
  // Check if email credentials are configured
  if (!isEmailConfigured()) {
    console.log(`📧 [TEST MODE] Would send email to ${to}:`);
    console.log(`   Subject: ${template.subject}`);
    console.log(`   Message: ${template.html.substring(0, 200)}...`);
    console.log(`   To actually send emails, set EMAIL_USER and EMAIL_PASSWORD in .env`);
    return { success: true, messageId: 'test-mode', testMode: true };
  }
  
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"ASTU Analytics" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Create and send notification (both email and database) - TO ALL RESEARCHERS
const createAndSendNotificationToAll = async (project, options) => {
  const { type, title, message, priority, milestone, daysUntil, template } = options;
  
  // Get ALL researchers who want notifications
  const allRecipients = await getAllNotificationRecipients();
  
  if (allRecipients.length === 0) {
    console.log('⚠️ No users with notification emails set');
    return [];
  }
  
  const notifications = [];
  
  // Send to ALL researchers
  for (const recipient of allRecipients) {
    // Prepare notification data
    const notificationData = {
      userId: recipient.userId,
      userName: recipient.name,
      userEmail: recipient.email,
      type,
      priority,
      title,
      message,
      projectId: project._id,
      projectTitle: project.title,
      milestoneId: milestone?._id,
      milestoneTitle: milestone?.title,
      daysUntil,
      actionUrl: 'http://localhost:3001/community',
      emailSent: false
    };
    
    // Save to database first
    const savedNotification = await saveNotification(notificationData);
    
    // Send email
    if (template && recipient.email) {
      const emailResult = await sendEmail(recipient.email, template);
      
      // Update notification with email status
      if (savedNotification && emailResult.success) {
        savedNotification.emailSent = true;
        savedNotification.emailSentAt = new Date();
        await savedNotification.save();
      }
    }
    
    notifications.push(savedNotification);
  }
  
  return notifications;
};

// Create and send notification to specific user (project lead)
const createAndSendNotification = async (project, options) => {
  const { type, title, message, priority, milestone, daysUntil, template } = options;
  
  // Get project lead user info
  const researcher = await getResearcherUser(project.lead);
  
  if (!researcher) {
    console.log(`⚠️ No notification email set for ${project.lead}`);
    return null;
  }
  
  // Prepare notification data
  const notificationData = {
    userId: researcher.userId,
    userName: researcher.name,
    userEmail: researcher.email,
    type,
    priority,
    title,
    message,
    projectId: project._id,
    projectTitle: project.title,
    milestoneId: milestone?._id,
    milestoneTitle: milestone?.title,
    daysUntil,
    actionUrl: 'http://localhost:3001/community',
    emailSent: false
  };
  
  // Save to database first
  const savedNotification = await saveNotification(notificationData);
  
  // Send email
  if (template && researcher.email) {
    const emailResult = await sendEmail(researcher.email, template);
    
    // Update notification with email status
    if (savedNotification && emailResult.success) {
      savedNotification.emailSent = true;
      savedNotification.emailSentAt = new Date();
      await savedNotification.save();
    }
  }
  
  return savedNotification;
};

// Check deadlines and send alerts (7 days before)
const checkUpcomingDeadlines = async () => {
  try {
    console.log('🔍 Checking for upcoming deadlines...');
    
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    // Check project end dates
    const projects = await Community.find({
      status: { $in: ['active', 'ongoing'] },
      endDate: {
        $gte: today,
        $lte: sevenDaysFromNow
      }
    });
    
    let notificationsSent = 0;
    for (const project of projects) {
      const daysUntil = Math.ceil((new Date(project.endDate) - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil === 7 || daysUntil === 3 || daysUntil === 1) {
        const template = emailTemplates.deadlineWarning(project, null, daysUntil);
        
        // Send to project lead only
        await createAndSendNotification(project, {
          type: 'deadline',
          title: `Deadline Alert: ${project.title}`,
          message: `Project deadline is approaching in ${daysUntil} days`,
          priority: daysUntil === 1 ? 'high' : 'medium',
          daysUntil,
          template
        });
        
        notificationsSent++;
      }
    }
    
    console.log(`✅ Deadline check complete. ${notificationsSent} notification(s) sent.`);
    return { success: true, notificationsSent };
  } catch (error) {
    console.error('❌ Error checking deadlines:', error.message);
    return { success: false, error: error.message };
  }
};

// Check overdue milestones and escalate if needed
const checkOverdueMilestones = async () => {
  try {
    console.log('🔍 Checking for overdue milestones...');
    
    const Milestone = require('../models/Milestone');
    const today = new Date();
    
    // Find overdue milestones (not completed)
    const overdueMilestones = await Milestone.find({
      dueDate: { $lt: today },
      status: { $nin: ['completed', 'cancelled'] }
    });
    
    let alertsSent = 0;
    let escalationsSent = 0;
    
    for (const milestone of overdueMilestones) {
      const project = await Community.findById(milestone.projectId);
      if (!project) continue;
      
      const daysOverdue = Math.ceil((today - new Date(milestone.dueDate)) / (1000 * 60 * 60 * 24));
      
      // Send alert to project lead
      const template = emailTemplates.milestoneOverdue(project, milestone, daysOverdue);
      
      await createAndSendNotification(project, {
        type: 'overdue',
        title: `Milestone Overdue: ${milestone.title}`,
        message: `Milestone is ${daysOverdue} days overdue`,
        priority: daysOverdue > 14 ? 'critical' : 'high',
        milestone,
        daysUntil: -daysOverdue, // Negative for overdue
        template
      });
      
      alertsSent++;
      
      // Escalate if more than 14 days overdue
      if (daysOverdue > 14 && !milestone.escalated) {
        const escalationTemplate = emailTemplates.escalationAlert(
          project, 
          milestone, 
          daysOverdue,
          'Department Head'
        );
        
        // Send escalation notification to project lead
        await createAndSendNotification(project, {
          type: 'escalation',
          title: `ESCALATION: ${milestone.title}`,
          message: `Milestone is ${daysOverdue} days overdue - Department Head notified`,
          priority: 'critical',
          milestone,
          daysUntil: -daysOverdue,
          template: escalationTemplate
        });
        
        escalationsSent++;
        
        // Mark milestone as escalated
        milestone.escalated = true;
        milestone.escalatedDate = new Date();
        await milestone.save();
      }
    }
    
    console.log(`✅ Overdue check complete. ${alertsSent} alert(s), ${escalationsSent} escalation(s) sent.`);
    return { success: true, alertsSent, escalationsSent };
  } catch (error) {
    console.error('❌ Error checking overdue milestones:', error.message);
    return { success: false, error: error.message };
  }
};

// Check expiring ethics approvals
const checkExpiringEthics = async () => {
  try {
    console.log('🔍 Checking for expiring ethics approvals...');
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const projects = await Community.find({
      ethicsStatus: 'approved',
      ethicsExpiryDate: {
        $gte: today,
        $lte: thirtyDaysFromNow
      }
    });
    
    let notificationsSent = 0;
    for (const project of projects) {
      const daysUntil = Math.ceil((new Date(project.ethicsExpiryDate) - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil === 30 || daysUntil === 14 || daysUntil === 7 || daysUntil === 3) {
        const template = emailTemplates.ethicsExpiring(project, daysUntil);
        
        // Send to project lead only
        await createAndSendNotification(project, {
          type: 'ethics',
          title: `Ethics Approval Expiring: ${project.title}`,
          message: `Ethics approval expires in ${daysUntil} days`,
          priority: daysUntil <= 7 ? 'high' : 'medium',
          daysUntil,
          template
        });
        
        notificationsSent++;
      }
    }
    
    console.log(`✅ Ethics check complete. ${notificationsSent} notification(s) sent.`);
    return { success: true, notificationsSent };
  } catch (error) {
    console.error('❌ Error checking expiring ethics:', error.message);
    return { success: false, error: error.message };
  }
};

// Manual trigger for testing
const sendTestEmail = async (to) => {
  const testProject = {
    title: 'Test Project - IoT Smart Campus System',
    lead: 'Dr. Abraham Gebre',
    college: 'College of Electrical Engineering & Computing',
    status: 'active',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    budgetETB: 500000
  };
  
  const testMilestone = {
    title: 'First Quarter Review',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'in_progress'
  };
  
  const template = emailTemplates.deadlineWarning(testProject, testMilestone, 7);
  return await sendEmail(to, template);
};

module.exports = {
  sendEmail,
  emailTemplates,
  checkUpcomingDeadlines,
  checkOverdueMilestones,
  checkExpiringEthics,
  sendTestEmail,
  getResearcherUser,
  getAllNotificationRecipients,
  saveNotification,
  createAndSendNotification,
  createAndSendNotificationToAll
};
