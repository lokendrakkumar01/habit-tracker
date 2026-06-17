const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.put('/subscribe', userController.subscribe);
router.put('/unsubscribe', userController.unsubscribe);
router.delete('/account', userController.deleteAccount);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/search', userController.searchUsers);
router.post('/friend-request/:userId', userController.sendFriendRequest);
router.post('/friend-request/:userId/accept', userController.acceptFriendRequest);

module.exports = router;
