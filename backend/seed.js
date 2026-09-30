require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User.model');
const ParkingLot = require('./models/ParkingLot.model');
const ParkingFloor = require('./models/ParkingFloor.model');
const ParkingSlot = require('./models/ParkingSlot.model');
const Reservation = require('./models/Reservation.model');
const Payment = require('./models/Payment.model');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingspot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const seedData = async () => {
  try {
    // 1. Clear Database
    await User.deleteMany({});
    await ParkingLot.deleteMany({});
    await ParkingFloor.deleteMany({});
    await ParkingSlot.deleteMany({});
    await Reservation.deleteMany({});
    await Payment.deleteMany({});
    
    console.log('Database cleared.');

    // 2. Create Users
    const password = await bcrypt.hash('password123', 10);
    
    const admin = await User.create({
      firstName: 'Admin', lastName: 'User', email: 'admin@parkingspot.com', password, role: 'admin'
    });

    const owner1 = await User.create({
      firstName: 'Jane', lastName: 'Doe', email: 'owner@parkingspot.com', password, role: 'owner',
      businessName: 'Downtown Parking LLC', subscription: 'PRO'
    });

    const commuter1 = await User.create({
      firstName: 'John', lastName: 'Smith', email: 'commuter@parkingspot.com', password, role: 'commuter'
    });

    console.log('Users created.');

    // 3. Create Parking Lot
    const lot1 = await ParkingLot.create({
      owner: owner1._id,
      name: 'Downtown Central Garage',
      description: 'Premium secure parking in the heart of the city.',
      address: { street: '123 Main St', city: 'Metropolis', state: 'NY', postalCode: '10001' },
      location: { type: 'Point', coordinates: [ -73.9855, 40.7484 ] },
      totalCapacity: 50,
      availableSlots: 45,
      operatingHours: { open: '06:00', close: '22:00', is24Hours: false },
      amenities: ['covered', 'security', 'cctv'],
      pricing: { basePrice: 15, peakPrice: 20, weekendSurcharge: 5, evSurcharge: 2, premiumSurcharge: 5 },
      commissionRate: 0.12,
      status: 'active'
    });

    console.log('Parking lot created.');

    // 4. Create Floors and Slots
    const floor1 = await ParkingFloor.create({
      parkingLot: lot1._id,
      floorNumber: 1,
      label: 'Level 1 - VIP',
      totalSlots: 20,
      availableSlots: 18
    });

    // Generate slots
    const slots = [];
    for (let i = 1; i <= 20; i++) {
      let type = 'standard';
      if (i <= 5) type = 'premium';
      if (i >= 18) type = 'ev';
      
      let status = 'available';
      if (i === 1) status = 'occupied';
      if (i === 2) status = 'reserved';

      slots.push({
        parkingLot: lot1._id,
        floor: floor1._id,
        slotNumber: `1A-${i.toString().padStart(2, '0')}`,
        type,
        status,
      });
    }
    const createdSlots = await ParkingSlot.insertMany(slots);

    // Update floor with slots reference (not strictly required if one-to-many is resolved via virtuals, but good practice if array is on schema)
    floor1.slots = createdSlots.map(s => s._id);
    await floor1.save();

    console.log('Floors and Slots created.');

    // 5. Create Mock Bookings & Revenue
    const now = new Date();
    
    // Past booking (completed)
    const res1 = await Reservation.create({
      commuter: commuter1._id,
      parkingLot: lot1._id,
      parkingSlot: createdSlots[3]._id, // 1A-04
      vehicle: new mongoose.Types.ObjectId(), // Mock vehicle
      startTime: new Date(now.getTime() - 24 * 3600000), // yesterday
      endTime: new Date(now.getTime() - 22 * 3600000),
      totalAmount: 30,
      commission: 3.6,
      ownerAmount: 26.4,
      status: 'completed',
      paymentStatus: 'paid',
      passCode: 'PS-MOCK1'
    });

    // Active booking
    const res2 = await Reservation.create({
      commuter: commuter1._id,
      parkingLot: lot1._id,
      parkingSlot: createdSlots[0]._id, // 1A-01 (occupied)
      vehicle: new mongoose.Types.ObjectId(),
      startTime: new Date(now.getTime() - 1 * 3600000), // 1 hour ago
      endTime: new Date(now.getTime() + 1 * 3600000),   // 1 hour from now
      actualCheckIn: new Date(now.getTime() - 55 * 60000),
      totalAmount: 30,
      commission: 3.6,
      ownerAmount: 26.4,
      status: 'active',
      paymentStatus: 'paid',
      passCode: 'PS-MOCK2'
    });

    // Future booking
    const res3 = await Reservation.create({
      commuter: commuter1._id,
      parkingLot: lot1._id,
      parkingSlot: createdSlots[1]._id, // 1A-02 (reserved)
      vehicle: new mongoose.Types.ObjectId(),
      startTime: new Date(now.getTime() + 2 * 3600000),
      endTime: new Date(now.getTime() + 5 * 3600000),
      totalAmount: 45,
      commission: 5.4,
      ownerAmount: 39.6,
      status: 'confirmed',
      paymentStatus: 'paid',
      passCode: 'PS-MOCK3'
    });

    // Payments
    await Payment.create({ reservation: res1._id, commuter: commuter1._id, amount: 30, status: 'completed', transactionId: 'TXN1' });
    await Payment.create({ reservation: res2._id, commuter: commuter1._id, amount: 30, status: 'completed', transactionId: 'TXN2' });
    await Payment.create({ reservation: res3._id, commuter: commuter1._id, amount: 45, status: 'completed', transactionId: 'TXN3' });

    console.log('Bookings and Payments created.');

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
