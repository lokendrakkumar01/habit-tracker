const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // protect all AI routes

router.get('/suggestions', aiController.getSmartSuggestions);
router.get('/burnout', aiController.getBurnoutReport);
router.get('/predictions', aiController.getMissedHabitPredictions);
router.get('/growth-report', aiController.getMonthlyGrowthReport);

module.exports = router;
