const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // protect all social routes

// Friends
router.get('/friends', socialController.getFriendsData);
router.post('/friends/request/:id', socialController.sendFriendRequest);
router.post('/friends/accept/:id', socialController.acceptFriendRequest);
router.post('/friends/follow/:id', socialController.followUser);

// Communities
router.get('/communities', socialController.getCommunities);
router.post('/communities', socialController.createCommunity);
router.post('/communities/join/:id', socialController.joinCommunity);
router.post('/communities/post/:id', socialController.createPost);
router.post('/communities/like/:communityId/:postId', socialController.likePost);

// Challenges
router.get('/challenges', socialController.getChallenges);
router.post('/challenges', socialController.createChallenge);
router.post('/challenges/join/:id', socialController.joinChallenge);

// Leaderboard
router.get('/leaderboard', socialController.getGlobalLeaderboard);

module.exports = router;
