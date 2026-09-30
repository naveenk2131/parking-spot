require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User.model');
const Vehicle = require('../models/Vehicle.model');
const ParkingLot = require('../models/ParkingLot.model');
const ParkingFloor = require('../models/ParkingFloor.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const Reservation = require('../models/Reservation.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingspot';

const demoLocations = [
  { name: 'Central Square Parking', price: 40, lat: 28.6289, lng: 77.2065, cap: 100, desc: 'Secure underground parking at Connaught Place.' },
  { name: 'City Mall Parking', price: 50, lat: 28.5273, lng: 77.2171, cap: 250, desc: 'Convenient mall parking in Saket.' },
  { name: 'Metro Business Parking', price: 35, lat: 28.5562, lng: 77.1000, cap: 80, desc: 'Affordable parking near Aerocity.' },
  { name: 'Market Street Parking', price: 30, lat: 28.5677, lng: 77.2433, cap: 60, desc: 'Open parking near Lajpat Nagar market.' },
  { name: 'Hospital Visitor Parking', price: 25, lat: 28.5670, lng: 77.2010, cap: 150, desc: 'Safe visitor parking at AIIMS.' },
  { name: 'Office District Parking', price: 45, lat: 28.4900, lng: 77.0800, cap: 200, desc: 'Premium covered parking in Cyber City.' },
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      ParkingLot.deleteMany({}),
      ParkingFloor.deleteMany({}),
      ParkingSlot.deleteMany({}),
      Reservation.deleteMany({})
    ]);

    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const owner1 = await User.create({
      firstName: 'City',
      lastName: 'Parking Corp',
      email: 'owner@parkingspot.com',
      password: hashedPassword,
      role: 'owner',
      businessName: 'City Parking Solutions',
      subscription: 'PRO',
      isEmailVerified: true
    });

    const commuter1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'commuter',
      isEmailVerified: true
    });

    console.log('Creating vehicles...');
    await Vehicle.create({
      owner: commuter1._id,
      licensePlate: 'DL-01-AB-1234',
      year: 2022,
      make: 'Honda',
      model: 'City',
      color: 'Silver',
      type: 'sedan',
      isDefault: true
    });

    console.log('Creating parking lots & slots...');
    for (const loc of demoLocations) {
      const lot = await ParkingLot.create({
        owner: owner1._id,
        name: loc.name,
        description: loc.desc,
        address: { street: 'Demo St', city: 'Delhi', state: 'DL', postalCode: '110001', country: 'IN' },
        location: { type: 'Point', coordinates: [loc.lng, loc.lat] },
        totalCapacity: loc.cap,
        availableSlots: Math.floor(loc.cap * 0.7),
        operatingHours: { open: '00:00', close: '23:59', is24Hours: true },
        amenities: ['covered', 'security', 'cctv'],
        pricing: { basePrice: loc.price, peakPrice: loc.price + 10, weekendSurcharge: 5 },
        commissionRate: 0.12,
        status: 'active'
      });

      const floor = await ParkingFloor.create({
        parkingLot: lot._id,
        floorNumber: 1,
        label: 'Level 1',
        totalSlots: 20,
        availableSlots: 15
      });

      const slots = [];
      const statuses = ['available', 'available', 'available', 'occupied', 'reserved', 'maintenance'];
      for (let i = 1; i <= 20; i++) {
        slots.push({
          parkingLot: lot._id,
          floor: floor._id,
          slotNumber: `A${i.toString().padStart(2, '0')}`,
          type: 'standard', // covers cars
          status: statuses[i % statuses.length]
        });
      }
      await ParkingSlot.insertMany(slots);
    }

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
