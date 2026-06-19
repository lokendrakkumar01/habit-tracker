const Notification = require('../models/Notification');

const ACHIEVEMENT_DEFINITIONS = {
  first_habit: { title: 'First Step', description: 'Created your first habit', badge: '🌱', xp: 50 },
  first_complete: { title: 'Getting Started', description: 'Completed a habit for the first time', badge: '✅', xp: 25 },
  streak_7: { title: 'Week Warrior', description: '7-day streak achieved', badge: '🔥', xp: 100 },
  streak_30: { title: 'Monthly Master', description: '30-day streak achieved', badge: '💪', xp: 500 },
  streak_100: { title: 'Century Club', description: '100-day streak achieved', badge: '🏆', xp: 2000 },
  consistency_master: { title: 'Consistency Master', description: '90% completion rate for 30 days', badge: '⭐', xp: 1000 },
  account_verified: { title: 'Verified', description: 'Verified email address', badge: '✉️', xp: 50 },
  habit_5: { title: 'Habit Builder', description: 'Created 5 habits', badge: '📚', xp: 150 },
  habit_10: { title: 'Habit Champion', description: 'Created 10 habits', badge: '🏅', xp: 300 },
};

const XP_PER_COMPLETION = 10;
const STREAK_BONUS_MULTIPLIER = 0.5;

/**
 * Calculate XP earned for a completion based on streak
 */
exports.calculateXP = (streak) => {
  const bonus = Math.floor(streak * STREAK_BONUS_MULTIPLIER);
  return XP_PER_COMPLETION + bonus;
};

/**
 * Award XP to user and recalculate level
 */
exports.awardXP = async (user, xpAmount, reason) => {
  const oldLevel = user.level || 1;
  user.xp = (user.xp || 0) + xpAmount;
  user.calculateLevel();

  if (user.level > oldLevel) {
    try {
      await Notification.create({
        user: user._id,
        type: 'achievement',
        title: 'Level Up! ⚡',
        message: `Congratulations! You've reached Level ${user.level}! Keep up the great work!`,
      });
    } catch (err) {
      console.error('Failed to create level up notification:', err.message);
    }
  }
};

/**
 * Unlock an achievement for a user
 */
exports.unlockAchievement = async (user, achievementType, xpOverride) => {
  const alreadyUnlocked = user.achievements.some((a) => a.type === achievementType);
  if (alreadyUnlocked) return;

  const definition = ACHIEVEMENT_DEFINITIONS[achievementType];
  if (!definition) return;

  user.achievements.push({ type: achievementType, unlockedAt: new Date() });

  if (!user.badges.includes(definition.badge)) {
    user.badges.push(definition.badge);
  }

  const xpToAward = xpOverride || definition.xp;
  await exports.awardXP(user, xpToAward, achievementType);

  try {
    await Notification.create({
      user: user._id,
      type: 'achievement',
      title: `Badge Unlocked! ${definition.badge}`,
      message: `You earned the "${definition.title}" badge for: ${definition.description}!`,
    });
  } catch (err) {
    console.error('Failed to create achievement notification:', err.message);
  }
};

/**
 * Check and unlock streak-based achievements
 */
exports.checkStreakAchievements = async (user, streak) => {
  if (streak >= 7) await exports.unlockAchievement(user, 'streak_7');
  if (streak >= 30) await exports.unlockAchievement(user, 'streak_30');
  if (streak >= 100) await exports.unlockAchievement(user, 'streak_100');
};

/**
 * Get all achievement definitions
 */
exports.getAllAchievements = () => ACHIEVEMENT_DEFINITIONS;

/**
 * Get level name based on level number
 */
exports.getLevelName = (level) => {
  const levels = ['Beginner', 'Novice', 'Apprentice', 'Practitioner', 'Expert', 'Master', 'Grand Master', 'Legend'];
  return levels[Math.min(level - 1, levels.length - 1)];
};
