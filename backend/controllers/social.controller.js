const User = require('../models/User');
const Community = require('../models/Community');
const Challenge = require('../models/Challenge');

// ─── Friends & Following ───────────────────────────────────────────────────

exports.getFriendsData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'name email avatar xp level badges')
      .populate('friendRequests', 'name email avatar xp level badges')
      .populate('following', 'name email avatar xp level badges')
      .populate('followers', 'name email avatar xp level badges');

    res.json({
      success: true,
      friends: user.friends,
      friendRequests: user.friendRequests,
      following: user.following,
      followers: user.followers,
    });
  } catch (error) { next(error); }
};

exports.sendFriendRequest = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    if (targetUser.friendRequests.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push(req.user.id);
    await targetUser.save();

    res.json({ success: true, message: 'Friend request sent successfully' });
  } catch (error) { next(error); }
};

exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const senderUser = await User.findById(req.params.id);

    if (!user.friendRequests.includes(req.params.id)) {
      return res.status(400).json({ success: false, message: 'No friend request from this user' });
    }

    // Move from requests to friends list
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== req.params.id);
    if (!user.friends.includes(req.params.id)) user.friends.push(req.params.id);
    await user.save();

    if (!senderUser.friends.includes(req.user.id)) {
      senderUser.friends.push(req.user.id);
      await senderUser.save();
    }

    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) { next(error); }
};

exports.followUser = async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id);
    const target = await User.findById(req.params.id);

    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    if (!me.following.includes(req.params.id)) {
      me.following.push(req.params.id);
      await me.save();
    }

    if (!target.followers.includes(req.user.id)) {
      target.followers.push(req.user.id);
      await target.save();
    }

    res.json({ success: true, message: `Successfully followed ${target.name}` });
  } catch (error) { next(error); }
};

// ─── Communities ──────────────────────────────────────────────────────────

exports.getCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find()
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .populate('posts.user', 'name avatar');
    res.json({ success: true, communities });
  } catch (error) { next(error); }
};

exports.createCommunity = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const community = await Community.create({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id],
    });
    res.status(201).json({ success: true, community });
  } catch (error) { next(error); }
};

exports.joinCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    community.members.push(req.user.id);
    await community.save();

    res.json({ success: true, community });
  } catch (error) { next(error); }
};

exports.createPost = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    const newPost = {
      user: req.user.id,
      content: req.body.content,
      likes: [],
      comments: [],
    };

    community.posts.push(newPost);
    await community.save();

    res.json({ success: true, posts: community.posts });
  } catch (error) { next(error); }
};

exports.likePost = async (req, res, next) => {
  try {
    const { communityId, postId } = req.params;
    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    const post = community.posts.id(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await community.save();
    res.json({ success: true, post });
  } catch (error) { next(error); }
};

// ─── Challenges ───────────────────────────────────────────────────────────

exports.getChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({ isActive: true }).populate('creator', 'name');
    res.json({ success: true, challenges });
  } catch (error) { next(error); }
};

exports.createChallenge = async (req, res, next) => {
  try {
    const { title, description, category, endDate, targetDays, xpReward, badgeReward } = req.body;
    const challenge = await Challenge.create({
      title,
      description,
      category,
      creator: req.user.id,
      startDate: new Date(),
      endDate: new Date(endDate),
      targetDays,
      xpReward,
      badgeReward,
      participants: [{ user: req.user.id, progress: 0, completed: false }],
    });
    res.status(201).json({ success: true, challenge });
  } catch (error) { next(error); }
};

exports.joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const alreadyJoined = challenge.participants.some((p) => p.user.toString() === req.user.id);
    if (alreadyJoined) return res.status(400).json({ success: false, message: 'Already joined challenge' });

    challenge.participants.push({ user: req.user.id, progress: 0, completed: false });
    await challenge.save();

    res.json({ success: true, challenge });
  } catch (error) { next(error); }
};

// ─── Leaderboard ──────────────────────────────────────────────────────────

exports.getGlobalLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await User.find()
      .select('name avatar xp level badges')
      .sort({ xp: -1 })
      .limit(10);
    res.json({ success: true, leaderboard });
  } catch (error) { next(error); }
};
