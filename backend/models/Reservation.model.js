const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    commuter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: true,
    },
    parkingSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    actualCheckIn: { type: Date, default: null },
    actualCheckOut: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show', 'expired'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    ownerAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    // QR code pass (Phase 2)
    passCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    overstayFee: {
      type: Number,
      default: 0
    },
    gracePeriodPenalty: {
      type: Number,
      default: 0
    },
    spotRecoveryApplied: {
      type: Boolean,
      default: false
    },
    recoveryNote: {
      type: String
    }
  },
  { timestamps: true }
);

reservationSchema.index({ commuter: 1, status: 1 });
reservationSchema.index({ parkingLot: 1, startTime: 1, endTime: 1 });
reservationSchema.index({ parkingSlot: 1, startTime: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ createdAt: -1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
