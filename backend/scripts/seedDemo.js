/**
 * ParkingSpot Demo Data Seed Script
 * Seeds realistic demo parking lots, floors, slots, and a test owner/commuter
 * SAFE: Checks for existing data before inserting. Run as many times as needed.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User.model');
const ParkingLot = require('../models/ParkingLot.model');
const ParkingFloor = require('../models/ParkingFloor.model');
const ParkingSlot = require('../models/ParkingSlot.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parkingspot';

// Bengaluru demo area (realistic Indian city)
const DEMO_LOTS = [
  {
    name: 'Koramangala Central Parking',
    description: 'Multi-level covered parking in the heart of Koramangala. Secure, well-lit with 24/7 CCTV.',
    address: { street: '80 Feet Road, 5th Block', city: 'Koramangala', state: 'Karnataka', postalCode: '560034', country: 'India' },
    location: { type: 'Point', coordinates: [77.6244, 12.9352] },
    totalCapacity: 120,
    availableSlots: 42,
    pricing: { basePrice: 40, peakPrice: 60, weekendSurcharge: 10 },
    amenities: ['covered', 'security', 'cctv', 'accessible'],
    operatingHours: { open: '06:00', close: '23:00', is24Hours: false },
    status: 'active',
    isVerified: true,
    isFeatured: true,
    rating: { average: 4.5, count: 128 },
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
    floors: [
      { floorNumber: 0, label: 'Ground Floor (G)', slotPrefix: 'G', slotCount: 20, availableCount: 14 },
      { floorNumber: 1, label: 'Level 1 (P1)', slotPrefix: 'A', slotCount: 20, availableCount: 15 },
      { floorNumber: 2, label: 'Level 2 (P2)', slotPrefix: 'B', slotCount: 20, availableCount: 13 },
    ]
  },
  {
    name: 'Tech Park Basement — Whitefield',
    description: 'Office basement parking open after hours and on weekends. Air-conditioned, EV charging available.',
    address: { street: 'EPIP Zone, Whitefield', city: 'Whitefield', state: 'Karnataka', postalCode: '560066', country: 'India' },
    location: { type: 'Point', coordinates: [77.7480, 12.9698] },
    totalCapacity: 80,
    availableSlots: 55,
    pricing: { basePrice: 50, peakPrice: 70, weekendSurcharge: 0, evSurcharge: 10 },
    amenities: ['covered', 'security', 'ev_charging', 'cctv', 'accessible'],
    operatingHours: { open: '07:00', close: '22:00', is24Hours: false },
    status: 'active',
    isVerified: true,
    isFeatured: false,
    rating: { average: 4.2, count: 64 },
    images: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80'],
    floors: [
      { floorNumber: -1, label: 'Basement B1', slotPrefix: 'B1', slotCount: 25, availableCount: 18 },
      { floorNumber: -2, label: 'Basement B2', slotPrefix: 'B2', slotCount: 25, availableCount: 20 },
    ]
  },
  {
    name: 'Phoenix MarketCity Parking',
    description: 'Spacious mall parking with valet service. Easy access from Outer Ring Road.',
    address: { street: 'Whitefield Main Road, ITPL', city: 'Whitefield', state: 'Karnataka', postalCode: '560048', country: 'India' },
    location: { type: 'Point', coordinates: [77.7108, 12.9948] },
    totalCapacity: 200,
    availableSlots: 76,
    pricing: { basePrice: 60, peakPrice: 80, weekendSurcharge: 20 },
    amenities: ['covered', 'security', 'cctv', 'valet', 'accessible', 'car_wash'],
    operatingHours: { open: '10:00', close: '22:00', is24Hours: false },
    status: 'active',
    isVerified: true,
    isFeatured: true,
    rating: { average: 4.7, count: 312 },
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
    floors: [
      { floorNumber: 0, label: 'Ground (GF)', slotPrefix: 'GF', slotCount: 30, availableCount: 10 },
      { floorNumber: 1, label: 'Level 1', slotPrefix: 'L1', slotCount: 30, availableCount: 22 },
      { floorNumber: 2, label: 'Level 2', slotPrefix: 'L2', slotCount: 30, availableCount: 25 },
    ]
  },
  {
    name: 'MG Road Market Square Parking',
    description: 'Open-air parking in the bustling MG Road commercial zone. Budget-friendly option.',
    address: { street: 'Brigade Road, Near Amoeba', city: 'MG Road', state: 'Karnataka', postalCode: '560001', country: 'India' },
    location: { type: 'Point', coordinates: [77.6060, 12.9756] },
    totalCapacity: 60,
    availableSlots: 18,
    pricing: { basePrice: 30, peakPrice: 50, weekendSurcharge: 10 },
    amenities: ['security', 'cctv'],
    operatingHours: { open: '08:00', close: '21:00', is24Hours: false },
    status: 'active',
    isVerified: true,
    isFeatured: false,
    rating: { average: 3.8, count: 45 },
    images: ['https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&q=80'],
    floors: [
      { floorNumber: 0, label: 'Open Ground', slotPrefix: 'OG', slotCount: 30, availableCount: 10 },
    ]
  },
  {
    name: 'Indiranagar Business District Parking',
    description: 'Premium covered parking with 24/7 security. Ideal for business meetings and overnight stays.',
    address: { street: '100 Feet Road, 12th Main', city: 'Indiranagar', state: 'Karnataka', postalCode: '560038', country: 'India' },
    location: { type: 'Point', coordinates: [77.6409, 12.9784] },
    totalCapacity: 90,
    availableSlots: 34,
    pricing: { basePrice: 45, peakPrice: 65, weekendSurcharge: 15, premiumSurcharge: 10 },
    amenities: ['covered', 'security', 'cctv', 'ev_charging', 'premium_spaces'],
    operatingHours: { open: '00:00', close: '23:59', is24Hours: true },
    status: 'active',
    isVerified: true,
    isFeatured: false,
    rating: { average: 4.4, count: 87 },
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    floors: [
      { floorNumber: -1, label: 'Basement B1', slotPrefix: 'B', slotCount: 25, availableCount: 10 },
      { floorNumber: 0,  label: 'Ground (G)',  slotPrefix: 'G', slotCount: 25, availableCount: 12 },
    ]
  },
  {
    name: 'Jayanagar Residential Night Parking',
    description: 'Affordable gated community parking. Perfect for overnight stays. Residents area with visitor spots.',
    address: { street: '4th Block, 11th Cross', city: 'Jayanagar', state: 'Karnataka', postalCode: '560011', country: 'India' },
    location: { type: 'Point', coordinates: [77.5823, 12.9279] },
    totalCapacity: 50,
    availableSlots: 32,
    pricing: { basePrice: 25, peakPrice: 35, weekendSurcharge: 5 },
    amenities: ['security', 'cctv'],
    operatingHours: { open: '20:00', close: '08:00', is24Hours: false },
    status: 'active',
    isVerified: false,
    isFeatured: false,
    rating: { average: 4.0, count: 23 },
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
    floors: [
      { floorNumber: 0, label: 'Visitor Parking', slotPrefix: 'V', slotCount: 20, availableCount: 14 },
    ]
  },
  {
    name: 'Manipal Hospital Visitor Parking',
    description: 'Dedicated visitor parking for hospital visitors. Accessible design, near emergency entrance.',
    address: { street: '98 HAL Airport Road', city: 'Old Airport Road', state: 'Karnataka', postalCode: '560017', country: 'India' },
    location: { type: 'Point', coordinates: [77.6566, 12.9610] },
    totalCapacity: 70,
    availableSlots: 28,
    pricing: { basePrice: 35, peakPrice: 45, weekendSurcharge: 0 },
    amenities: ['covered', 'security', 'accessible', 'cctv'],
    operatingHours: { open: '00:00', close: '23:59', is24Hours: true },
    status: 'active',
    isVerified: true,
    isFeatured: false,
    rating: { average: 4.1, count: 56 },
    images: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&q=80'],
    floors: [
      { floorNumber: 0, label: 'Ground Floor',  slotPrefix: 'GF', slotCount: 20, availableCount: 8  },
      { floorNumber: 1, label: 'First Floor',   slotPrefix: 'F1', slotCount: 20, availableCount: 12 },
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    // ── 1. Ensure demo owner user exists ──────────────────────────────────────
    let owner = await User.findOne({ email: 'demoowner@parkingspot.in' });
    if (!owner) {
      const hash = await bcrypt.hash('Demo@1234', 12);
      owner = await User.create({
        firstName: 'Rajan',
        lastName: 'Verma',
        email: 'demoowner@parkingspot.in',
        password: hash,
        role: 'owner',
        businessName: 'Verma Parking Solutions',
        isActive: true,
      });
      console.log('✅ Created demo owner: demoowner@parkingspot.in / Demo@1234');
    } else {
      console.log('ℹ️  Demo owner already exists');
    }

    // ── 2. Ensure demo commuter exists ────────────────────────────────────────
    let commuter = await User.findOne({ email: 'demouser@parkingspot.in' });
    if (!commuter) {
      const hash = await bcrypt.hash('Demo@1234', 12);
      commuter = await User.create({
        firstName: 'Arjun',
        lastName: 'Sharma',
        email: 'demouser@parkingspot.in',
        password: hash,
        role: 'commuter',
        isActive: true,
      });
      console.log('✅ Created demo commuter: demouser@parkingspot.in / Demo@1234');
    } else {
      console.log('ℹ️  Demo commuter already exists');
    }

    // ── 3. Seed parking lots ──────────────────────────────────────────────────
    for (const lotDef of DEMO_LOTS) {
      // Check if lot already exists by name
      const existing = await ParkingLot.findOne({ name: lotDef.name });
      if (existing) {
        console.log(`ℹ️  Lot already exists: "${lotDef.name}"`);
        continue;
      }

      const { floors: floorDefs, ...lotData } = lotDef;
      const lot = await ParkingLot.create({
        ...lotData,
        owner: owner._id,
        availableSlots: lotDef.availableSlots,
      });
      console.log(`✅ Created lot: "${lot.name}" (${lot._id})`);

      // Create floors and slots
      for (const fd of floorDefs) {
        // Check unique index: parkingLot + floorNumber
        const existingFloor = await ParkingFloor.findOne({ parkingLot: lot._id, floorNumber: fd.floorNumber });
        if (existingFloor) continue;

        const floor = await ParkingFloor.create({
          parkingLot: lot._id,
          floorNumber: fd.floorNumber,
          label: fd.label,
          totalSlots: fd.slotCount,
          availableSlots: fd.availableCount,
          isActive: true,
        });

        // Create slots for this floor
        const statuses = ['available', 'available', 'available', 'reserved', 'occupied', 'maintenance'];
        const slotDocs = [];
        for (let i = 1; i <= fd.slotCount; i++) {
          const num = String(i).padStart(2, '0');
          // Make first availableCount slots available, rest mixed
          let status;
          if (i <= fd.availableCount) {
            status = 'available';
          } else {
            const remaining = fd.slotCount - fd.availableCount;
            const remIdx = i - fd.availableCount - 1;
            // Distribute: ~60% reserved, 30% occupied, 10% maintenance
            if (remIdx % 10 < 6) status = 'reserved';
            else if (remIdx % 10 < 9) status = 'occupied';
            else status = 'maintenance';
          }

          const isEV = (i % 10 === 0); // every 10th slot is EV
          const isPremium = (i === 1 || i === 2); // first 2 are premium

          slotDocs.push({
            parkingLot: lot._id,
            floor: floor._id,
            slotNumber: `${fd.slotPrefix}-${num}`,
            type: isEV ? 'ev' : isPremium ? 'premium' : 'standard',
            status,
            isActive: true,
          });
        }

        await ParkingSlot.insertMany(slotDocs);
        console.log(`  → Floor "${fd.label}": ${fd.slotCount} slots created`);
      }
    }

    console.log('\n🎉 Demo seed complete!');
    console.log('Login credentials:');
    console.log('  Owner:    demoowner@parkingspot.in / Demo@1234');
    console.log('  Commuter: demouser@parkingspot.in / Demo@1234');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
