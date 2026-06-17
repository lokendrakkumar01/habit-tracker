const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.post('/:id/milestones', goalController.addMilestone);
router.put('/:goalId/milestones/:milestoneId/toggle', goalController.toggleMilestone);

module.exports = router;
