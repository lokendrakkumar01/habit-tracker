const streakService = require('../services/streak.service');
const HabitLog = require('../models/HabitLog');

jest.mock('../models/HabitLog');

describe('Streak Service - updateStreak', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should increase streak by 1 if completed today and no yesterday log', async () => {
    const habit = { _id: '123', currentStreak: 0, longestStreak: 0 };
    HabitLog.findOne.mockResolvedValue(null);

    const result = await streakService.updateStreak(habit, new Date());
    expect(result.newStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  test('should keep streak same if completed multiple times on same day', async () => {
    const today = new Date();
    const habit = { 
      _id: '123', 
      currentStreak: 5, 
      longestStreak: 5,
      lastCompletedDate: today
    };
    HabitLog.findOne.mockResolvedValue(null);

    const result = await streakService.updateStreak(habit, today);
    expect(result.newStreak).toBe(5);
  });
});
