const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: [
        'Health', 'Fitness', 'Study', 'Coding', 'Reading',
        'Meditation', 'Productivity', 'Personal Development', 'Custom',
      ],
      default: 'Productivity',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      }
    ],
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    targetDays: {
      type: Number,
      default: 7,
    },
    xpReward: {
      type: Number,
      default: 100,
    },
    badgeReward: {
      type: String,
      default: '🏆',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

challengeSchema.index({ isActive: 1, endDate: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
