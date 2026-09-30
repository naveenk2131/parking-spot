const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User.model');
const Vehicle = require('../models/Vehicle.model');
const ParkingLot = require('../models/ParkingLot.model');
const ParkingFloor = require('../models/ParkingFloor.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const Reservation = require('../models/Reservation.model');
const Payment = require('../models/Payment.model');
const Review = require('../models/Review.model');
const Waitlist = require('../models/Waitlist.model');
const Notification = require('../models/Notification.model');
const AuditLog = require('../models/AuditLog.model');
const OccupancyEvent = require('../models/OccupancyEvent.model');
const PricingRule = require('../models/PricingRule.model');
const CorporateAccount = require('../models/CorporateAccount.model');
const Subscription = require('../models/Subscription.model');
const Promotion = require('../models/Promotion.model');
const AssistantSession = require('../models/AssistantSession.model');

async function syncAllIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingspot');
    console.log('Connected to MongoDB. Syncing indexes...');

    const models = [
      User, Vehicle, ParkingLot, ParkingFloor, ParkingSlot, Reservation, 
      Payment, Review, Waitlist, Notification, AuditLog,
      OccupancyEvent, PricingRule, CorporateAccount, Subscription, 
      Promotion, AssistantSession
    ];

    for (const model of models) {
      await model.syncIndexes();
      console.log(`Indexes synced for ${model.modelName}`);
    }

    console.log('All indexes synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing indexes:', error);
    process.exit(1);
  }
}

syncAllIndexes();
