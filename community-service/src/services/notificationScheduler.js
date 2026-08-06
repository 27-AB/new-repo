const cron = require('node-cron');
const {
  checkUpcomingDeadlines,
  checkOverdueMilestones,
  checkExpiringEthics
} = require('./notificationService');

// Schedule notification checks
const startNotificationScheduler = () => {
  console.log('🚀 Starting notification scheduler...');
  
  // Check deadlines every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily deadline check (9:00 AM)');
    await checkUpcomingDeadlines();
  });
  
  // Check overdue milestones every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Running daily overdue check (10:00 AM)');
    await checkOverdueMilestones();
  });
  
  // Check expiring ethics every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily ethics expiry check (8:00 AM)');
    await checkExpiringEthics();
  });
  
  // FOR TESTING: Run checks every 5 minutes
  // Uncomment this during testing, comment out in production
  /*
  cron.schedule('*\/5 * * * *', async () => {
    console.log('⏰ Running test checks (every 5 minutes)');
    await checkUpcomingDeadlines();
    await checkOverdueMilestones();
    await checkExpiringEthics();
  });
  */
  
  console.log('✅ Notification scheduler started successfully');
  console.log('📅 Scheduled tasks:');
  console.log('   - Daily deadline check: 9:00 AM');
  console.log('   - Daily overdue check: 10:00 AM');
  console.log('   - Daily ethics check: 8:00 AM');
};

module.exports = { startNotificationScheduler };
