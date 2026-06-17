const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    stripePaymentIntentId: { type: String },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'] },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'incomplete', 'trialing'],
      default: 'active',
    },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'usd' },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    invoices: [
      {
        invoiceId: String,
        amount: Number,
        status: String,
        paidAt: Date,
        invoiceUrl: String,
      },
    ],
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
