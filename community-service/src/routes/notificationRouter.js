const express = require('express');
const router = express.Router();
const {
  sendTest,
  checkDeadlines,
  checkOverdue,
  checkEthics,
  runAllChecks,
  getSettings,
  sendCustom
} = require('../controllers/notificationController');

// NOTE: Authentication temporarily disabled for debugging
// TODO: Re-enable authentication before production

// POST /notifications/test - Send test email
router.post('/test', sendTest);

// POST /notifications/check/deadlines - Manually check upcoming deadlines
router.post('/check/deadlines', checkDeadlines);

// POST /notifications/check/overdue - Manually check overdue milestones
router.post('/check/overdue', checkOverdue);

// POST /notifications/check/ethics - Manually check expiring ethics
router.post('/check/ethics', checkEthics);

// POST /notifications/check/all - Run all checks
router.post('/check/all', runAllChecks);

// GET /notifications/settings - Get notification settings
router.get('/settings', getSettings);

// POST /notifications/custom - Send custom notification
router.post('/custom', sendCustom);

module.exports = router;
