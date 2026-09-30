const mongoose = require('mongoose');

const occupancyEventSchema = new mongoose.Schema({
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingFloor'
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot'
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  eventType: {
    type: String,
    enum: [
      'VEHICLE_ENTERED',
      'VEHICLE_EXITED',
      'SLOT_OCCUPIED',
      'SLOT_RELEASED',
      'MAINTENANCE_STARTED',
      'MAINTENANCE_ENDED'
    ],
    required: true
  },
  source: {
    type: String, // e.g. 'hardware_sensor', 'manual_admin', 'booking_system'
    default: 'booking_system'
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

occupancyEventSchema.index({ parkingLot: 1, createdAt: -1 });
occupancyEventSchema.index({ slot: 1 });

module.exports = mongoose.model('OccupancyEvent', occupancyEventSchema);
