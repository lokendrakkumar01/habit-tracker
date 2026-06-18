const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User');

/**
 * Get Smart suggestions for new habits based on current profile
 */
exports.getSmartSuggestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const existingHabits = await Habit.find({ user: userId, isArchived: false });
    const existingCategories = existingHabits.map((h) => h.category);

    const allSuggestions = [
      { title: 'Morning Meditation', description: 'Start your day with 10 minutes of mindfulness', category: 'Meditation', icon: '🧘', difficulty: 'Easy' },
      { title: 'Daily Coding Practice', description: 'Solve 1 coding challenge or write clean code', category: 'Coding', icon: '💻', difficulty: 'Medium' },
      { title: 'Read 10 Pages', description: 'Consistent reading to expand knowledge and focus', category: 'Reading', icon: '📚', difficulty: 'Easy' },
      { title: 'Cardio Workout', description: '30 mins of running, cycling or walking', category: 'Fitness', icon: '🏃', difficulty: 'Medium' },
      { title: 'Gratitude Journaling', description: 'Write down 3 things you are grateful for today', category: 'Health', icon: '✍️', difficulty: 'Easy' },
      { title: 'Hydrate (3L Water)', description: 'Drink sufficient water throughout the day', category: 'Health', icon: '💧', difficulty: 'Easy' },
      { title: 'Weekly Budget Review', description: 'Track and review expenses and savings goals', category: 'Custom', icon: '💰', difficulty: 'Medium' },
      { title: 'Deep Work Session', description: '90 minutes of distraction-free focused execution', category: 'Productivity', icon: '⚡', difficulty: 'Hard' }
    ];

    // Filter out categories user already has, or suggest categories they might benefit from
    const suggestions = allSuggestions.filter(
      (s) => !existingHabits.some((h) => h.title.toLowerCase().includes(s.title.toLowerCase()))
    );

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 3)
    });
  } catch (error) { next(error); }
};

/**
 * Perform statistical analysis to predict burnout
 */
exports.getBurnoutReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const logs = await HabitLog.find({
      user: userId,
      date: { $gte: fourteenDaysAgo, $lte: today }
    });

    // Calculate rates for week 1 vs week 2
    const midPoint = new Date();
    midPoint.setDate(midPoint.getDate() - 7);

    const week1Logs = logs.filter((l) => l.date < midPoint);
    const week2Logs = logs.filter((l) => l.date >= midPoint);

    const week1Completions = week1Logs.filter((l) => l.completed).length;
    const week2Completions = week2Logs.filter((l) => l.completed).length;

    const rate1 = week1Logs.length > 0 ? week1Completions / week1Logs.length : 1;
    const rate2 = week2Logs.length > 0 ? week2Completions / week2Logs.length : 1;

    const rateDrop = rate1 - rate2;
    let burnoutStatus = 'low';
    let message = 'Your productivity levels are highly stable. Keep up the amazing consistency!';

    if (rateDrop > 0.4) {
      burnoutStatus = 'high';
      message = 'Alert: We detected a sharp decline in your completions this week (down by over 40%). We recommend using a Streak Freeze, lowering your habit targets, or taking a planned recovery day to prevent burnout.';
    } else if (rateDrop > 0.15) {
      burnoutStatus = 'moderate';
      message = 'Attention: Your habit completion rate has dropped slightly. Make sure to schedule rest and prioritize your highest-value habits.';
    }

    res.json({
      success: true,
      burnoutStatus,
      completionRateTrend: {
        week1: Math.round(rate1 * 100),
        week2: Math.round(rate2 * 100),
        drop: Math.round(rateDrop * 100)
      },
      coachMessage: message
    });
  } catch (error) { next(error); }
};

/**
 * Predict missed habits based on historical patterns
 */
exports.getMissedHabitPredictions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const logs = await HabitLog.find({ user: userId })
      .populate('habit', 'title')
      .sort({ date: -1 })
      .limit(100);

    const predictions = [];

    // Analyze day-of-week completions for each habit
    const habitStats = {};
    logs.forEach((log) => {
      if (!log.habit) return;
      const habitId = log.habit._id.toString();
      const habitTitle = log.habit.title;
      const dayOfWeek = new Date(log.date).getDay(); // 0-6

      if (!habitStats[habitId]) {
        habitStats[habitId] = { title: habitTitle, days: Array(7).fill(0).map(() => ({ total: 0, completed: 0 })) };
      }
      habitStats[habitId].days[dayOfWeek].total++;
      if (log.completed) {
        habitStats[habitId].days[dayOfWeek].completed++;
      }
    });

    Object.keys(habitStats).forEach((hId) => {
      const stats = habitStats[hId];
      stats.days.forEach((day, index) => {
        if (day.total >= 3) {
          const completionRate = day.completed / day.total;
          if (completionRate < 0.4) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            predictions.push({
              habitId: hId,
              title: stats.title,
              dayOfWeek: dayNames[index],
              probability: Math.round((1 - completionRate) * 100),
              tip: `You historically struggle with "${stats.title}" on ${dayNames[index]}s. Set an early reminder or commit to just 5 minutes on this day.`
            });
          }
        }
      });
    });

    // Default prediction if not enough historical data
    if (predictions.length === 0) {
      const activeHabits = await Habit.find({ user: userId, isArchived: false }).limit(2);
      activeHabits.forEach((h) => {
        predictions.push({
          habitId: h._id,
          title: h.title,
          dayOfWeek: 'Sunday',
          probability: 45,
          tip: `Strengthen your Sunday routine. Complete "${h.title}" early in the morning to protect your streak.`
        });
      });
    }

    res.json({
      success: true,
      predictions: predictions.slice(0, 3)
    });
  } catch (error) { next(error); }
};

/**
 * Dynamic monthly report generator
 */
exports.getMonthlyGrowthReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const habitsCount = await Habit.countDocuments({ user: userId, isArchived: false });
    const completionsCount = await HabitLog.countDocuments({ user: userId, completed: true });

    let message = `Hello Coach! You have created ${habitsCount} habits and completed them ${completionsCount} times. `;
    if (completionsCount > 50) {
      message += "You are entering the 'Consistency Zone'! Focus on maintaining streak multipliers to level up faster.";
    } else {
      message += "Every small step counts. Aim to complete at least one habit today to build momentum.";
    }

    res.json({
      success: true,
      growthReport: {
        summary: message,
        forecastedConsistency: Math.min(100, 60 + (user.level * 5)),
        focusScore: Math.min(100, 50 + (habitsCount * 4)),
        wellnessScore: 75
      }
    });
  } catch (error) { next(error); }
};
