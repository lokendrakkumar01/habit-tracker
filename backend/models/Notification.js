const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'reminder', 'streak_alert', 'achievement', 'friend_request',
        'system', 'missed_habit', 'goal_deadline',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    scheduledFor: { type: Date },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    relatedHabit: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit' },
    relatedGoal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ scheduledFor: 1, sent: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
