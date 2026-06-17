const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User');
const streakService = require('../services/streak.service');
const gamificationService = require('../services/gamification.service');

// @GET /api/habits
exports.getHabits = async (req, res, next) => {
  try {
    const { category, priority, archived } = req.query;
    const filter = { user: req.user.id };
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    filter.isArchived = archived === 'true';

    const habits = await Habit.find(filter).sort({ createdAt: -1 });

    // Get today's completion status for each habit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await HabitLog.find({
      user: req.user.id,
      date: { $gte: today, $lt: tomorrow },
    });

    const logMap = {};
    todayLogs.forEach((log) => {
      logMap[log.habit.toString()] = log;
    });

    const habitsWithStatus = habits.map((habit) => {
      const log = logMap[habit._id.toString()];
      return {
        ...habit.toObject(),
        todayCompleted: log ? log.completed : false,
        todayLog: log || null,
      };
    });

    res.json({ success: true, count: habits.length, habits: habitsWithStatus });
  } catch (error) {
    next(error);
  }
};

// @GET /api/habits/:id
exports.getHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    // Get recent 30 logs
    const logs = await HabitLog.find({ habit: habit._id })
      .sort({ date: -1 })
      .limit(30);

    res.json({ success: true, habit, logs });
  } catch (error) {
    next(error);
  }
};

// Helper to normalize frontend habit data to backend schema constraints
const normalizeHabitData = (data) => {
  const payload = { ...data };

  if (payload.category) {
    const catMap = {
      health: 'Health',
      fitness: 'Fitness',
      study: 'Study',
      coding: 'Coding',
      reading: 'Reading',
      meditation: 'Meditation',
      mindfulness: 'Meditation',
      learning: 'Study',
      productivity: 'Productivity',
      social: 'Personal Development',
      creativity: 'Custom',
      finance: 'Custom',
      other: 'Custom',
    };
    const normCat = catMap[payload.category.toLowerCase()];
    if (normCat) {
      payload.category = normCat;
    } else {
      payload.category = payload.category.charAt(0).toUpperCase() + payload.category.slice(1);
    }
  }

  if (payload.priority) {
    const priMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    };
    const normPri = priMap[payload.priority.toLowerCase()];
    if (normPri) payload.priority = normPri;
  }

  if (payload.targetDays) {
    let days = payload.targetDays;
    if (typeof days === 'string') {
      try {
        const cleanStr = days.replace(/'/g, '"');
        days = JSON.parse(cleanStr);
      } catch (e) {}
    }
    
    if (Array.isArray(days)) {
      const dayNames = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
      payload.targetDays = days.map(d => {
        if (typeof d === 'number') return d;
        if (typeof d === 'string') {
          const num = dayNames[d.toLowerCase().substring(0, 3)];
          return num !== undefined ? num : parseInt(d, 10);
        }
        return d;
      }).filter(d => !isNaN(d) && d >= 0 && d <= 6);
    }
  }

  return payload;
};

// @POST /api/habits
exports.createHabit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Free plan limit
    if (user.subscription.plan === 'free') {
      const activeHabits = await Habit.countDocuments({ user: req.user.id, isArchived: false });
      if (activeHabits >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Free plan allows maximum 5 habits. Upgrade to Premium for unlimited habits.',
        });
      }
    }

    const normalizedData = normalizeHabitData(req.body);
    const habit = await Habit.create({ ...normalizedData, user: req.user.id });

    user.totalHabitsCreated += 1;

    // First habit achievement
    if (user.totalHabitsCreated === 1) {
      await gamificationService.unlockAchievement(user, 'first_habit', 50);
    }
    await user.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, habit });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/habits/:id
exports.updateHabit = async (req, res, next) => {
  try {
    const normalizedData = normalizeHabitData(req.body);
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      normalizedData,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, habit });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/habits/:id
exports.deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    await HabitLog.deleteMany({ habit: req.params.id });
    res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/habits/:id/archive
exports.archiveHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isArchived: true, isActive: false },
      { new: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit archived', habit });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/habits/:id/restore
exports.restoreHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isArchived: false, isActive: true },
      { new: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit restored', habit });
  } catch (error) {
    next(error);
  }
};

// @POST /api/habits/:id/complete
exports.completeHabit = async (req, res, next) => {
  try {
    const { note, mood } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let log = await HabitLog.findOne({
      habit: habit._id,
      user: req.user.id,
      date: { $gte: today, $lt: tomorrow },
    });

    const wasCompleted = log ? log.completed : false;

    if (!log) {
      log = new HabitLog({ habit: habit._id, user: req.user.id, date: today });
    }

    log.completed = !wasCompleted;
    log.completedAt = log.completed ? new Date() : null;
    log.note = note || log.note;
    log.mood = mood || log.mood;

    if (log.completed) {
      // Update streak
      const { newStreak, longestStreak } = await streakService.updateStreak(habit, today);
      habit.currentStreak = newStreak;
      habit.longestStreak = Math.max(longestStreak, habit.longestStreak);
      habit.lastCompletedDate = today;
      habit.totalCompletions += 1;
      log.streakAtCompletion = newStreak;

      // XP for completion
      const xpEarned = gamificationService.calculateXP(newStreak);
      log.xpEarned = xpEarned;

      const user = await User.findById(req.user.id);
      await gamificationService.awardXP(user, xpEarned, 'habit_complete');

      // Check achievements
      await gamificationService.checkStreakAchievements(user, newStreak);
      await user.save({ validateBeforeSave: false });
    } else {
      // Uncompleting - reverse streak
      habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
      await streakService.recalculateStreak(habit);
    }

    await Promise.all([log.save(), habit.save()]);

    res.json({ success: true, log, habit });
  } catch (error) {
    next(error);
  }
};

// @GET /api/habits/:id/logs
exports.getHabitLogs = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { habit: req.params.id, user: req.user.id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const logs = await HabitLog.find(filter).sort({ date: -1 });
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};
