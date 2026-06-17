const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Payment = require('../models/Payment');

// @GET /api/admin/stats
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, verifiedUsers, premiumUsers, totalHabits, totalLogs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ 'subscription.plan': 'premium' }),
      Habit.countDocuments(),
      HabitLog.countDocuments({ completed: true }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

    res.json({
      success: true,
      stats: { totalUsers, verifiedUsers, premiumUsers, totalHabits, totalLogs, newUsersToday },
    });
  } catch (error) { next(error); }
};

// @GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const users = await User.find(filter)
      .select('-password -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, page: parseInt(page) });
  } catch (error) { next(error); }
};

// @PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

// @DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Habit.deleteMany({ user: req.params.id });
    await HabitLog.deleteMany({ user: req.params.id });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};
