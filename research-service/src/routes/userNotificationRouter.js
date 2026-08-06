const express = require('express');
const router = express.Router();
const userNotificationController = require('../controllers/userNotificationController');

// Get user's notifications
router.get('/user/:userId', userNotificationController.getUserNotifications);

// Get unread count
router.get('/user/:userId/unread-count', userNotificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', userNotificationController.markAsRead);

// Mark all as read
router.patch('/user/:userId/read-all', userNotificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', userNotificationController.deleteNotification);

// Delete all notifications
router.delete('/user/:userId/all', userNotificationController.deleteAllNotifications);

module.exports = router;
