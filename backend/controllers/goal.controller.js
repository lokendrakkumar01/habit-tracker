const Goal = require('../models/Goal');

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).populate('linkedHabits', 'title icon color').sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) { next(error); }
};

const normalizeGoalData = (data) => {
  const payload = { ...data };
  if (payload.priority) {
    const priMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    };
    const normPri = priMap[payload.priority.toLowerCase()];
    if (normPri) payload.priority = normPri;
  }
  
  if (payload.category) {
    const catMap = {
      health: 'Health',
      fitness: 'Fitness',
      learning: 'Study',
      career: 'Personal Development',
      finance: 'Custom',
      personal: 'Personal Development',
      relationships: 'Personal Development',
      other: 'Custom',
    };
    const normCat = catMap[payload.category.toLowerCase()];
    if (normCat) {
      payload.category = normCat;
    } else {
      payload.category = payload.category.charAt(0).toUpperCase() + payload.category.slice(1);
    }
  }
  return payload;
};

exports.createGoal = async (req, res, next) => {
  try {
    const normalizedData = normalizeGoalData(req.body);
    const goal = await Goal.create({ ...normalizedData, user: req.user.id });
    res.status(201).json({ success: true, goal });
  } catch (error) { next(error); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const normalizedData = normalizeGoalData(req.body);
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      normalizedData,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) { next(error); }
};

exports.addMilestone = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    goal.milestones.push({ ...req.body, order: goal.milestones.length });
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};

exports.toggleMilestone = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.goalId, user: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });
    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;
    const completedCount = goal.milestones.filter((m) => m.completed).length;
    goal.progress = goal.milestones.length > 0
      ? Math.round((completedCount / goal.milestones.length) * 100)
      : 0;
    if (goal.progress === 100) goal.status = 'completed';
    await goal.save();
    res.json({ success: true, goal });
  } catch (error) { next(error); }
};
