const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: { type: String, maxlength: [1000, 'Description too long'] },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: String, default: 'Personal Development' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '🎯' },

    linkedHabits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Habit' }],

    milestones: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        dueDate: { type: Date },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
