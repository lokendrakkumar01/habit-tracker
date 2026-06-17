const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: [
        'Health', 'Fitness', 'Study', 'Coding', 'Reading',
        'Meditation', 'Productivity', 'Personal Development', 'Custom',
      ],
      default: 'Productivity',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    icon: { type: String, default: '⭐' },
    color: { type: String, default: '#6366f1' },
    targetGoal: { type: String, default: '' },

    // Scheduling
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      default: 'daily',
    },
    targetDays: [{ type: Number, min: 0, max: 6 }], // 0=Sun, 6=Sat
    specificDates: [{ type: Number, min: 1, max: 31 }], // for monthly
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },

    // Reminders
    reminders: [
      {
        time: { type: String }, // "09:00"
        enabled: { type: Boolean, default: true },
      },
    ],

    // Status
    isArchived: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Streak tracking
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCompletedDate: { type: Date },

    // Stats
    totalCompletions: { type: Number, default: 0 },
    totalMissed: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },

    // Linked goals
    linkedGoals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
  },
  { timestamps: true }
);

habitSchema.index({ user: 1, isArchived: 1 });
habitSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Habit', habitSchema);
