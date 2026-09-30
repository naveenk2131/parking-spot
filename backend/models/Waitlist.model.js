const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
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
  requestedDate: {
    type: Date,
    required: true,
  },
  requestedStartTime: {
    type: String, // HH:mm
    required: true,
  },
  requestedDuration: {
    type: Number,
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  preferences: {
    type: [String], // e.g. ['ev', 'premium']
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'fulfilled', 'expired'],
    default: 'waiting',
  }
}, { timestamps: true });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);
module.exports = Waitlist;
