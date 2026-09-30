const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['FREE', 'PRO', 'BUSINESS'],
    default: 'FREE'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELLED', 'PAST_DUE'],
    default: 'ACTIVE'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  renewalDate: {
    type: Date
  },
  features: {
    dynamicPricing: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  },
  paymentReference: String
}, { timestamps: true });

subscriptionSchema.index({ owner: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
