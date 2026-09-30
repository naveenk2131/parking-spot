const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Parking lot name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: 'India' },
    },
    // Geospatial for future queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    availableSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
    operatingHours: {
      open: { type: String, default: '00:00' },   // e.g., "06:00"
      close: { type: String, default: '23:59' },  // e.g., "22:00"
      is24Hours: { type: Boolean, default: false },
    },
    amenities: [{
      type: String,
      enum: ['covered', 'security', 'ev_charging', 'accessible', 'cctv', 'valet', 'motorcycle', 'car_wash', 'premium_spaces'],
    }],
    images: [{ type: String }],
    timeBasedInventory: [{
      days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    }],
    pricing: {
      basePrice: { type: Number, default: 10 },
      peakPrice: { type: Number, default: 15 },
      weekendSurcharge: { type: Number, default: 5 },
      evSurcharge: { type: Number, default: 2 },
      premiumSurcharge: { type: Number, default: 5 }
    },
    commissionRate: {
      type: Number,
      default: 0.12 // 12% default platform commission
    },
    gracePeriodMinutes: {
      type: Number,
      default: 15
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'pending_review'],
      default: 'pending_review',
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Geospatial index
parkingLotSchema.index({ location: '2dsphere' });
parkingLotSchema.index({ owner: 1 });
parkingLotSchema.index({ status: 1 });
parkingLotSchema.index({ 'address.city': 1 });

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);
module.exports = ParkingLot;
