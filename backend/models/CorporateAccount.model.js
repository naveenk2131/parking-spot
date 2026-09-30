const mongoose = require('mongoose');

const corporateAccountSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  billingInformation: {
    billingPeriod: { type: String, enum: ['MONTHLY', 'ANNUALLY'], default: 'MONTHLY' },
    vatNumber: String,
    billingAddress: String
  },
  allocations: [{
    parkingLot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLot' },
    monthlyCapacity: Number,
    usedThisMonth: { type: Number, default: 0 }
  }],
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'PENDING'],
    default: 'PENDING'
  }
}, { timestamps: true });

corporateAccountSchema.index({ admin: 1 });
corporateAccountSchema.index({ companyName: 1 });

module.exports = mongoose.model('CorporateAccount', corporateAccountSchema);
