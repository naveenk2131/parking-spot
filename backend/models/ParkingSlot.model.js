const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: true,
    },
    floor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingFloor',
      required: true,
    },
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      trim: true,
      // e.g., "A1", "B12", "G-03"
    },
    type: {
      type: String,
      enum: ['standard', 'compact', 'accessible', 'ev', 'motorcycle', 'oversize', 'premium'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance', 'inactive'],
      default: 'available',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: [{
      type: String,
      enum: ['ev_charging', 'covered', 'cctv', 'accessible'],
    }],
    // Current active reservation (denormalized for quick lookup)
    currentReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
  },
  { timestamps: true }
);

parkingSlotSchema.index({ parkingLot: 1, slotNumber: 1 }, { unique: true });
parkingSlotSchema.index({ parkingLot: 1, status: 1 });
parkingSlotSchema.index({ floor: 1 });

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);
module.exports = ParkingSlot;
