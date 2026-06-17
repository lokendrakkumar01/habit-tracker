const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/weekly', analyticsController.getWeeklyData);
router.get('/monthly', analyticsController.getMonthlyData);
router.get('/yearly', analyticsController.getYearlyData);
router.get('/habits', analyticsController.getHabitPerformance);

module.exports = router;
