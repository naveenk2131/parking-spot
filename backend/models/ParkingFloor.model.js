const mongoose = require('mongoose');

const parkingFloorSchema = new mongoose.Schema(
  {
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: true,
    },
    floorNumber: {
      type: Number,
      required: [true, 'Floor number is required'],
    },
    label: {
      type: String,
      required: [true, 'Floor label is required'],
      trim: true,
      // e.g., "G", "P1", "Level 2"
    },
    totalSlots: {
      type: Number,
      required: true,
      min: 0,
    },
    availableSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

parkingFloorSchema.index({ parkingLot: 1, floorNumber: 1 }, { unique: true });

const ParkingFloor = mongoose.model('ParkingFloor', parkingFloorSchema);
module.exports = ParkingFloor;
