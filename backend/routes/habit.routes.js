const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habit.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.get('/:id', habitController.getHabit);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.put('/:id/archive', habitController.archiveHabit);
router.put('/:id/restore', habitController.restoreHabit);
router.post('/:id/complete', habitController.completeHabit);
router.get('/:id/logs', habitController.getHabitLogs);

module.exports = router;
