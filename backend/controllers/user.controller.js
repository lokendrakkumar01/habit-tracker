const User = require('../models/User');
const { cloudinary } = require('../middleware/upload.middleware');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// @GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'name avatar level xp')
      .populate('friendRequests', 'name avatar level xp')
      .populate('following', 'name avatar level xp');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, settings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, settings },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/users/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Cannot change password for Google accounts' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @POST /api/users/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // With CloudinaryStorage, req.file.path is already the Cloudinary URL
    const avatarUrl = req.file.path || req.file.secure_url || req.file.filename;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({ success: true, avatarUrl, user });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/users/account
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await Habit.deleteMany({ user: req.user.id });
    await HabitLog.deleteMany({ user: req.user.id });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @GET /api/users/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ isVerified: true })
      .select('name avatar xp level badges')
      .sort({ xp: -1 })
      .limit(20);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
};

// @POST /api/users/friend-request/:userId
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    if (targetUser.friendRequests.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push(req.user.id);
    await targetUser.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    next(error);
  }
};

// @POST /api/users/friend-request/:userId/accept
exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.userId);

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== req.params.userId
    );
    user.friends.push(req.params.userId);
    friend.friends.push(req.user.id);

    await Promise.all([user.save({ validateBeforeSave: false }), friend.save({ validateBeforeSave: false })]);
    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    next(error);
  }
};

// @GET /api/users/search
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user.id },
    }).select('name avatar level xp').limit(10);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/users/subscribe
exports.subscribe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.subscription.plan = 'premium';
    user.subscription.status = 'active';
    user.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Subscribed to premium successfully!', user });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/users/unsubscribe
exports.unsubscribe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.subscription.plan = 'free';
    user.subscription.status = 'inactive';
    user.subscription.currentPeriodEnd = null;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Subscription cancelled successfully!', user });
  } catch (error) {
    next(error);
  }
};

// @POST /api/users/profile/freeze
exports.redeemStreakFreeze = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.xp < 200) {
      return res.status(400).json({ success: false, message: 'You need at least 200 XP to redeem a Streak Freeze' });
    }
    user.xp -= 200;
    user.streakFreezesCount = (user.streakFreezesCount || 0) + 1;
    await user.save({ validateBeforeSave: false });
    res.json({
      success: true,
      message: 'Streak Freeze redeemed successfully! 200 XP consumed.',
      streakFreezesCount: user.streakFreezesCount,
      xp: user.xp,
      user
    });
  } catch (error) {
    next(error);
  }
};
