const mongoose = require('mongoose');

const serviceBookingSchema = new mongoose.Schema(
  {
    commuter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    premiumService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PremiumService',
      required: true,
    },
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: true,
    },
    // Linked to main parking reservation if applicable
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    serviceType: {
      type: String,
      enum: ['EV_CHARGING', 'VALET', 'CAR_WASH', 'PREMIUM_SLOT'],
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        'pending', 'confirmed', 'in_progress', 'completed', 'cancelled',
        // Valet-specific
        'vehicle_received', 'parked', 'ready_for_pickup',
      ],
      default: 'pending',
    },
    amount: { type: Number, required: true, min: 0 },
    commission: { type: Number, default: 0 },
    ownerAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    // Selected car wash package if applicable
    selectedPackage: {
      name: { type: String },
      price: { type: Number },
      duration: { type: Number },
    },
    cancellationReason: { type: String },
    notes: { type: String, maxlength: 500 },
    passCode: { type: String, sparse: true },
  },
  { timestamps: true }
);

serviceBookingSchema.index({ commuter: 1, status: 1 });
serviceBookingSchema.index({ premiumService: 1, startTime: 1, endTime: 1 });
serviceBookingSchema.index({ reservation: 1 });
serviceBookingSchema.index({ parkingLot: 1, serviceType: 1 });
serviceBookingSchema.index({ createdAt: -1 });

const ServiceBooking = mongoose.model('ServiceBooking', serviceBookingSchema);
module.exports = ServiceBooking;
