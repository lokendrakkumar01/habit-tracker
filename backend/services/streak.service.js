const HabitLog = require('../models/HabitLog');

/**
 * Update streak for a habit based on completion
 * @param {Object} habit - Habit document
 * @param {Date} completionDate - Date of completion (normalized to midnight)
 */
exports.updateStreak = async (habit, completionDate) => {
  const yesterday = new Date(completionDate);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if completed yesterday
  const yesterdayStart = new Date(yesterday);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const yesterdayLog = await HabitLog.findOne({
    habit: habit._id,
    date: { $gte: yesterdayStart, $lte: yesterdayEnd },
    completed: true,
  });

  let newStreak;
  if (yesterdayLog || habit.currentStreak === 0) {
    newStreak = habit.currentStreak + 1;
  } else {
    // Check if it's the same day (just a refresh)
    const todayStart = new Date(completionDate);
    todayStart.setHours(0, 0, 0, 0);
    if (habit.lastCompletedDate) {
      const lastCompleted = new Date(habit.lastCompletedDate);
      lastCompleted.setHours(0, 0, 0, 0);
      if (lastCompleted.getTime() === todayStart.getTime()) {
        newStreak = habit.currentStreak; // same day, no change
      } else {
        newStreak = 1; // streak broken, restart
      }
    } else {
      newStreak = 1;
    }
  }

  const longestStreak = Math.max(newStreak, habit.longestStreak || 0);
  return { newStreak, longestStreak };
};

/**
 * Recalculate streak from logs (used when uncompleting a habit)
 */
exports.recalculateStreak = async (habit) => {
  const logs = await HabitLog.find({ habit: habit._id, completed: true })
    .sort({ date: -1 })
    .limit(200);

  if (logs.length === 0) {
    habit.currentStreak = 0;
    return;
  }

  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (const log of logs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    const diff = (checkDate - logDate) / (1000 * 60 * 60 * 24);

    if (diff <= 1) {
      streak++;
      checkDate = logDate;
    } else {
      break;
    }
  }

  habit.currentStreak = streak;
};
