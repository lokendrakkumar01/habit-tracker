const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User');

// @GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalHabits, activeHabits, archivedHabits] = await Promise.all([
      Habit.countDocuments({ user: userId }),
      Habit.countDocuments({ user: userId, isArchived: false }),
      Habit.countDocuments({ user: userId, isArchived: true }),
    ]);

    // Today's stats
    const todayLogs = await HabitLog.find({
      user: userId,
      date: { $gte: today, $lt: tomorrow },
    });
    const completedToday = todayLogs.filter((l) => l.completed).length;

    // Streak stats
    const habits = await Habit.find({ user: userId, isArchived: false });
    const currentStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;
    const longestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak)) : 0;

    // 7-day completion
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekLogs = await HabitLog.find({
      user: userId,
      date: { $gte: sevenDaysAgo, $lt: tomorrow },
    });
    const weekCompleted = weekLogs.filter((l) => l.completed).length;
    const weekTotal = weekLogs.length;
    const weekCompletionRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    // Productivity score
    const user = await User.findById(userId);
    const productivityScore = Math.min(100, Math.round(weekCompletionRate * 0.6 + (currentStreak * 2)));

    res.json({
      success: true,
      stats: {
        totalHabits,
        activeHabits,
        archivedHabits,
        completedToday,
        todayTotal: activeHabits,
        completionRateToday: activeHabits > 0 ? Math.round((completedToday / activeHabits) * 100) : 0,
        currentStreak,
        longestStreak,
        weekCompletionRate,
        productivityScore,
        xp: user.xp,
        level: user.level,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/weekly
exports.getWeeklyData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await HabitLog.find({
      user: userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).populate('habit', 'title category color');

    // Group by day
    const dailyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayLogs = logs.filter(
        (l) => l.date.toISOString().split('T')[0] === dateStr
      );
      const completed = dayLogs.filter((l) => l.completed).length;
      const total = dayLogs.length;

      dailyData.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        completed,
        total,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    res.json({ success: true, weeklyData: dailyData });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/monthly
exports.getMonthlyData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const logs = await HabitLog.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Group by date for heatmap
    const heatmapData = {};
    logs.forEach((log) => {
      const dateStr = log.date.toISOString().split('T')[0];
      if (!heatmapData[dateStr]) heatmapData[dateStr] = { completed: 0, total: 0 };
      heatmapData[dateStr].total++;
      if (log.completed) heatmapData[dateStr].completed++;
    });

    const totalCompleted = logs.filter((l) => l.completed).length;
    const totalLogs = logs.length;

    res.json({
      success: true,
      monthlyData: {
        heatmap: heatmapData,
        totalCompleted,
        totalLogs,
        completionRate: totalLogs > 0 ? Math.round((totalCompleted / totalLogs) * 100) : 0,
        month: targetMonth,
        year: targetYear,
        logs: logs.map(l => ({
          habit: l.habit.toString(),
          completed: l.completed,
          date: l.date.toISOString().split('T')[0]
        }))
      },
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/habits
exports.getHabitPerformance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const habits = await Habit.find({ user: userId, isArchived: false });
    const habitIds = habits.map((h) => h._id);

    const logs = await HabitLog.find({
      user: userId,
      habit: { $in: habitIds },
      date: { $gte: thirtyDaysAgo },
    });

    const habitPerformance = habits.map((habit) => {
      const habitLogs = logs.filter((l) => l.habit.toString() === habit._id.toString());
      const completed = habitLogs.filter((l) => l.completed).length;
      const total = habitLogs.length;

      return {
        _id: habit._id,
        title: habit.title,
        category: habit.category,
        color: habit.color,
        icon: habit.icon,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total,
      };
    });

    // Category breakdown
    const categoryData = {};
    habitPerformance.forEach((h) => {
      if (!categoryData[h.category]) categoryData[h.category] = { completed: 0, total: 0, count: 0 };
      categoryData[h.category].completed += h.completed;
      categoryData[h.category].total += h.total;
      categoryData[h.category].count++;
    });

    res.json({ success: true, habits: habitPerformance, categories: categoryData });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/yearly
exports.getYearlyData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const logs = await HabitLog.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthLogs = logs.filter((l) => l.date.getMonth() === i);
      const completed = monthLogs.filter((l) => l.completed).length;
      return {
        month: new Date(year, i).toLocaleDateString('en', { month: 'short' }),
        completed,
        total: monthLogs.length,
        rate: monthLogs.length > 0 ? Math.round((completed / monthLogs.length) * 100) : 0,
      };
    });

    res.json({ success: true, yearlyData: monthlyData, year });
  } catch (error) {
    next(error);
  }
};
