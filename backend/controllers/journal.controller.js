const Journal = require('../models/Journal');

exports.getJournals = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const journals = await Journal.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('habitNotes.habit', 'title icon');
    const total = await Journal.countDocuments({ user: req.user.id });
    res.json({ success: true, journals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

exports.getJournalByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const journal = await Journal.findOne({ user: req.user.id, date: { $gte: targetDate, $lt: nextDay } })
      .populate('habitNotes.habit', 'title icon color');
    res.json({ success: true, journal });
  } catch (error) { next(error); }
};

exports.createOrUpdateJournal = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const moodScoreMap = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };

    let journal = await Journal.findOne({ user: req.user.id, date: { $gte: today, $lt: tomorrow } });
    if (journal) {
      Object.assign(journal, req.body);
      if (req.body.mood) journal.moodScore = moodScoreMap[req.body.mood];
      await journal.save();
    } else {
      journal = await Journal.create({
        ...req.body,
        user: req.user.id,
        date: today,
        moodScore: moodScoreMap[req.body.mood] || 3,
      });
    }
    res.json({ success: true, journal });
  } catch (error) { next(error); }
};

exports.deleteJournal = async (req, res, next) => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true, message: 'Journal entry deleted' });
  } catch (error) { next(error); }
};

exports.getMoodHistory = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const journals = await Journal.find({ user: req.user.id, date: { $gte: thirtyDaysAgo } })
      .select('date mood moodScore').sort({ date: 1 });
    res.json({ success: true, moodHistory: journals });
  } catch (error) { next(error); }
};
