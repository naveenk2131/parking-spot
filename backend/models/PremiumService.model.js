const mongoose = require('mongoose');

const premiumServiceSchema = new mongoose.Schema(
  {
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['EV_CHARGING', 'VALET', 'CAR_WASH', 'PREMIUM_SLOT'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    pricingType: {
      type: String,
      enum: ['fixed', 'per_hour', 'per_kwh', 'per_session'],
      default: 'fixed',
    },
    duration: {
      type: Number, // minutes
      default: 60,
    },
    capacity: {
      type: Number,
      default: 1,
      min: 1,
    },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
      is24Hours: { type: Boolean, default: false },
    },
    // EV Charging specific
    evConfig: {
      chargerType: { type: String, enum: ['AC_SLOW', 'AC_FAST', 'DC_FAST'], default: 'AC_SLOW' },
      connectorType: { type: String, enum: ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'Tesla'], default: 'Type2' },
      powerKw: { type: Number, default: 7.4 },
      numberOfChargers: { type: Number, default: 1 },
    },
    // Car Wash specific
    carWashConfig: {
      packages: [{
        name: { type: String },
        price: { type: Number },
        duration: { type: Number }, // minutes
        description: { type: String },
      }],
    },
    // Valet specific
    valetConfig: {
      serviceHours: { type: String },
      additionalFee: { type: Number, default: 0 },
    },
    // Premium Slot specific
    premiumSlotConfig: {
      features: [{ type: String }], // ['covered', 'closer_to_entrance', 'wider_space']
      linkedSlots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot' }],
    },
    requirements: { type: String, trim: true },
    terms: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

premiumServiceSchema.index({ parkingLot: 1, serviceType: 1 });
premiumServiceSchema.index({ parkingLot: 1, status: 1 });
premiumServiceSchema.index({ owner: 1 });

const PremiumService = mongoose.model('PremiumService', premiumServiceSchema);
module.exports = PremiumService;
