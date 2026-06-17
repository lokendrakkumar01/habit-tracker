const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journal.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', journalController.getJournals);
router.post('/', journalController.createOrUpdateJournal);
router.get('/mood-history', journalController.getMoodHistory);
router.get('/date/:date', journalController.getJournalByDate);
router.delete('/:id', journalController.deleteJournal);

module.exports = router;
