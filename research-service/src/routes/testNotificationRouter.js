const express = require('express');
const router = express.Router();
const { sendTestNotificationToAll } = require('../controllers/testNotificationController');

// Send test notification to all users
router.post('/test-all', sendTestNotificationToAll);

module.exports = router;
