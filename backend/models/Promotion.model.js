const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED'],
    default: 'PENDING'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  priorityLevel: {
    type: Number,
    default: 1 // Higher number = higher priority in search
  },
  adminApproval: {
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    notes: String
  }
}, { timestamps: true });

promotionSchema.index({ parkingLot: 1 });
promotionSchema.index({ status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
