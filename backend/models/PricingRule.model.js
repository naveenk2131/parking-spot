const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['PEAK', 'WEEKEND', 'SPECIAL_EVENT', 'EV_SURCHARGE', 'PREMIUM_SLOT', 'DYNAMIC_OCCUPANCY'],
    required: true
  },
  multiplier: {
    type: Number, // e.g., 1.5 for 50% increase
    default: 1
  },
  flatFee: {
    type: Number, // e.g., +$5
    default: 0
  },
  conditions: {
    occupancyThreshold: { type: Number }, // trigger when occupancy > X%
    daysOfWeek: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
    startTime: { type: String }, // '18:00'
    endTime: { type: String },   // '22:00'
  },
  effectiveStartDate: { type: Date },
  effectiveEndDate: { type: Date },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

pricingRuleSchema.index({ parkingLot: 1, status: 1 });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
