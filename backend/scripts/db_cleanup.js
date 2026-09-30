const mongoose = require('mongoose');

// Models
const User = require('../models/User.model');
const ParkingLot = require('../models/ParkingLot.model');
const ParkingFloor = require('../models/ParkingFloor.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const Reservation = require('../models/Reservation.model');
const Payment = require('../models/Payment.model');
const Waitlist = require('../models/Waitlist.model');
const Review = require('../models/Review.model');

async function verifyAndCleanup() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/parkingspot');
    console.log('Connected to parkingspot database for cleanup verification.');

    // 1. Check for orphaned ParkingLots
    const lots = await ParkingLot.find({});
    let orphanedLots = 0;
    for (const lot of lots) {
      const ownerExists = await User.exists({ _id: lot.owner });
      if (!ownerExists) {
        console.log(`Orphaned ParkingLot found: ${lot._id}`);
        // Optionally update status or handle
        orphanedLots++;
      }
    }

    // 2. Check for orphaned Reservations
    const reservations = await Reservation.find({});
    let orphanedReservations = 0;
    for (const res of reservations) {
      const lotExists = await ParkingLot.exists({ _id: res.parkingLot });
      const slotExists = await ParkingSlot.exists({ _id: res.parkingSlot });
      if (!lotExists || !slotExists) {
        console.log(`Orphaned Reservation found: ${res._id}. Resolving...`);
        if (res.status === 'pending' || res.status === 'confirmed' || res.status === 'active') {
          res.status = 'cancelled';
          res.cancellationReason = 'System: Underlying slot or lot removed.';
          await res.save();
        }
        orphanedReservations++;
      }
    }

    // 3. Status consistency in Slots
    const slots = await ParkingSlot.find({ status: 'occupied' });
    let inconsistentSlots = 0;
    for (const slot of slots) {
      if (slot.currentReservation) {
        const activeRes = await Reservation.findOne({ _id: slot.currentReservation, status: { $in: ['active', 'confirmed'] } });
        if (!activeRes) {
          console.log(`Inconsistent Slot found: ${slot._id} marked occupied but no active reservation. Fixing...`);
          slot.status = 'available';
          slot.currentReservation = null;
          await slot.save();
          inconsistentSlots++;
        }
      }
    }

    console.log(`Verification Complete.`);
    console.log(`- Orphaned Lots Detected: ${orphanedLots}`);
    console.log(`- Orphaned Reservations Handled: ${orphanedReservations}`);
    console.log(`- Inconsistent Slots Reverted: ${inconsistentSlots}`);

    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

verifyAndCleanup();
