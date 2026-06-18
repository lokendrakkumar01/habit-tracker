const User = require('../models/User');
const Payment = require('../models/Payment');

/**
 * Simulates Stripe / Razorpay checkout session creation or handles sandbox integration
 */
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { plan, billingCycle, gateway } = req.body;
    const userId = req.user.id;

    const priceMap = {
      monthly: 9.99,
      yearly: 79.99,
    };

    const amount = priceMap[billingCycle] || 9.99;

    // Create a pending payment log
    const payment = await Payment.create({
      user: userId,
      plan,
      billingCycle,
      amount,
      status: 'incomplete',
      currency: 'usd',
    });

    res.json({
      success: true,
      sessionId: `mock_session_${payment._id}`,
      gateway: gateway || 'stripe',
      amount,
      message: 'Sandbox checkout session initialized successfully.'
    });
  } catch (error) { next(error); }
};

/**
 * Verify checkout and upgrade user to premium
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { sessionId, status } = req.body;
    const userId = req.user.id;

    if (status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment status verification failed' });
    }

    const paymentId = sessionId.replace('mock_session_', '');
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    payment.status = 'active';
    payment.currentPeriodStart = new Date();
    
    const end = new Date();
    if (payment.billingCycle === 'yearly') {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    payment.currentPeriodEnd = end;
    await payment.save();

    // Upgrade the user
    const user = await User.findById(userId);
    user.subscription.plan = 'premium';
    user.subscription.status = 'active';
    user.subscription.currentPeriodEnd = end;
    await user.save();

    res.json({
      success: true,
      message: 'Plan successfully upgraded to Premium!',
      subscription: user.subscription
    });
  } catch (error) { next(error); }
};

/**
 * Webhook handler placeholder
 */
exports.handleWebhook = async (req, res, next) => {
  res.json({ received: true });
};
