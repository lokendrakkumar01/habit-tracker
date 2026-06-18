const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// Public webhook route (Stripe signature verification bypasses regular protect middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Protected endpoints
router.post('/checkout', protect, paymentController.createCheckoutSession);
router.post('/verify', protect, paymentController.verifyPayment);

module.exports = router;
