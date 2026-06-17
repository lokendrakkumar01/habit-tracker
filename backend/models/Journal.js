const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    content: {
      type: String,
      maxlength: [5000, 'Journal entry too long'],
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'bad', 'terrible'],
    },
    moodScore: { type: Number, min: 1, max: 5 },
    gratitude: [{ type: String }],
    habitNotes: [
      {
        habit: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit' },
        note: { type: String },
      },
    ],
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

journalSchema.index({ user: 1, date: -1 });
journalSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Journal', journalSchema);
