const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/',               ctrl.getNotifications);
router.get('/unread-count',   ctrl.getUnreadCount);
router.put('/mark-all-read',  ctrl.markAllRead);
router.put('/:id/read',       ctrl.markRead);
router.delete('/',            ctrl.clearAll);
router.delete('/:id',         ctrl.deleteNotification);

module.exports = router;
