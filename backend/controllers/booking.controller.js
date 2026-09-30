const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Reservation = require('../models/Reservation.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const ParkingLot = require('../models/ParkingLot.model');
const Payment = require('../models/Payment.model');
const { successResponse, errorResponse } = require('../utils/response');

// 1. Create Booking
exports.createBooking = async (req, res, next) => {
  try {
    const { parkingLotId, parkingSlotId, vehicleId, startTime, endTime, totalAmount } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return errorResponse(res, 'End time must be after start time.', 400);
    }

    // Double Booking Prevention
    const overlappingReservation = await Reservation.findOne({
      parkingSlot: parkingSlotId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlappingReservation) {
      return errorResponse(res, 'This slot is already reserved for the selected time period.', 409);
    }

    const lot = await ParkingLot.findById(parkingLotId);
    if (!lot) return errorResponse(res, 'Parking lot not found.', 404);

    // Time-Based Inventory Enforcement
    if (lot.timeBasedInventory && lot.timeBasedInventory.length > 0) {
      const startDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][start.getDay()];
      const startHour = start.getHours().toString().padStart(2, '0') + ':' + start.getMinutes().toString().padStart(2, '0');
      
      const isAllowed = lot.timeBasedInventory.some(inv => {
        if (!inv.days.includes(startDay)) return false;
        return (startHour >= inv.startTime && startHour <= inv.endTime);
      });

      if (!isAllowed) {
        return errorResponse(res, 'This parking lot is not available for booking at the requested time due to time-based inventory restrictions.', 403);
      }
    }

    const commissionRate = lot.commissionRate || 0.12;
    const commission = totalAmount * commissionRate;
    const ownerAmount = totalAmount - commission;

    const reservation = await Reservation.create({
      commuter: req.user._id,
      parkingLot: parkingLotId,
      parkingSlot: parkingSlotId,
      vehicle: vehicleId,
      startTime: start,
      endTime: end,
      totalAmount,
      commission,
      ownerAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    return successResponse(res, { reservation }, 'Booking initiated.', 201);
  } catch (error) {
    next(error);
  }
};

// 2. Process Demo Payment & Confirm Booking
exports.processDemoPayment = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, commuter: req.user._id });
    if (!reservation) return errorResponse(res, 'Reservation not found.', 404);
    if (reservation.status !== 'pending') return errorResponse(res, 'Reservation is not pending payment.', 400);

    const transactionId = `DEMO_TXN_${uuidv4().substring(0, 8)}`;

    const payment = await Payment.create({
      reservation: reservation._id,
      commuter: req.user._id,
      amount: reservation.totalAmount,
      method: 'card',
      status: 'completed',
      transactionId,
      gatewayResponse: { demo: true }
    });

    // Generate secure pass code
    const passCode = `PS-${uuidv4().substring(0, 12).toUpperCase()}`;

    // Confirm reservation
    reservation.status = 'confirmed';
    reservation.paymentStatus = 'paid';
    reservation.passCode = passCode;
    await reservation.save();

    // Mark slot as reserved if it's currently available and booking is happening now
    // For simplicity, we just trust the Reservation model overlap logic, but we can also update slot currentReservation.

    return successResponse(res, { reservation, payment }, 'Payment successful. Spot guaranteed.');
  } catch (error) {
    next(error);
  }
};

// 3. Check-In (Owner/Admin)
exports.verifyAndCheckIn = async (req, res, next) => {
  try {
    const { passCode } = req.body;
    
    const reservation = await Reservation.findOne({ passCode }).populate('parkingSlot vehicle commuter');
    if (!reservation) return errorResponse(res, 'Invalid QR code or pass code.', 404);

    // Validate ownership of parking lot (assuming req.user is the owner)
    // In a full app, check if req.user._id == parkingLot.owner
    
    if (reservation.status !== 'confirmed') {
      return errorResponse(res, `Cannot check-in. Booking status is ${reservation.status}.`, 400);
    }

    const now = new Date();
    // Allow check-in up to 30 mins early
    const earlyLimit = new Date(reservation.startTime.getTime() - 30 * 60000);
    
    if (now < earlyLimit) {
      return errorResponse(res, 'Too early for check-in.', 400);
    }

    reservation.status = 'active';
    reservation.actualCheckIn = now;
    await reservation.save();

    // Update slot status
    await ParkingSlot.findByIdAndUpdate(reservation.parkingSlot._id, { status: 'occupied', currentReservation: reservation._id });

    // Log Occupancy Event
    try {
      const OccupancyEvent = require('../models/OccupancyEvent.model');
      await OccupancyEvent.create({
        parkingLot: reservation.parkingLot,
        slot: reservation.parkingSlot._id,
        reservation: reservation._id,
        eventType: 'SLOT_OCCUPIED',
        source: 'booking_system',
        actor: req.user._id
      });
    } catch (err) {
      console.error('Failed to log occupancy event:', err);
    }

    return successResponse(res, { reservation }, 'Check-in successful.');
  } catch (error) {
    next(error);
  }
};

// 4. Extend Parking
exports.extendBooking = async (req, res, next) => {
  try {
    const { additionalEndTime, additionalAmount } = req.body;
    const end = new Date(additionalEndTime);

    const reservation = await Reservation.findOne({ _id: req.params.id, commuter: req.user._id });
    if (!reservation) return errorResponse(res, 'Reservation not found.', 404);
    if (!['confirmed', 'active'].includes(reservation.status)) {
      return errorResponse(res, 'Can only extend active or confirmed bookings.', 400);
    }

    if (end <= reservation.endTime) {
      return errorResponse(res, 'New end time must be after current end time.', 400);
    }

    // Double Booking Prevention for Extension
    const overlappingReservation = await Reservation.findOne({
      parkingSlot: reservation.parkingSlot,
      status: { $in: ['confirmed', 'active'] },
      _id: { $ne: reservation._id },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: reservation.endTime } }
      ]
    });

    if (overlappingReservation) {
      return errorResponse(res, 'Extension unavailable because this slot is reserved for another driver.', 409);
    }

    // Process additional demo payment
    const transactionId = `DEMO_EXT_${uuidv4().substring(0, 8)}`;
    await Payment.create({
      reservation: reservation._id,
      commuter: req.user._id,
      amount: additionalAmount,
      method: 'card',
      status: 'completed',
      transactionId,
      gatewayResponse: { demo: true, extension: true }
    });

    const lot = await ParkingLot.findById(reservation.parkingLot);
    const commissionRate = lot?.commissionRate || 0.12;
    const commission = additionalAmount * commissionRate;
    
    reservation.endTime = end;
    reservation.totalAmount += additionalAmount;
    reservation.commission += commission;
    reservation.ownerAmount += (additionalAmount - commission);
    await reservation.save();

    return successResponse(res, { reservation }, 'Parking extended successfully.');
  } catch (error) {
    next(error);
  }
};

// 5. Cancel Booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, commuter: req.user._id });
    if (!reservation) return errorResponse(res, 'Reservation not found.', 404);
    
    if (reservation.status !== 'confirmed' && reservation.status !== 'pending') {
      return errorResponse(res, 'Only confirmed or pending bookings can be cancelled.', 400);
    }

    reservation.status = 'cancelled';
    reservation.cancellationReason = req.body.reason || 'User requested';
    await reservation.save();

    // In a real app, process partial refund based on rules here
    if (reservation.paymentStatus === 'paid') {
       reservation.paymentStatus = 'refunded';
       await reservation.save();
       // Update payment record
       await Payment.findOneAndUpdate({ reservation: reservation._id }, { status: 'refunded', refundAmount: reservation.totalAmount });
    }

    // WAITLIST TRIGGER LOGIC
    try {
      const Waitlist = require('../models/Waitlist.model');
      const Notification = require('../models/Notification.model');

      const waitlistEntry = await Waitlist.findOne({
        parkingLot: reservation.parkingLot,
        status: 'waiting',
        requestedDate: {
          $gte: new Date(new Date(reservation.startTime).setHours(0,0,0,0)),
          $lte: new Date(new Date(reservation.startTime).setHours(23,59,59,999))
        }
      });

      if (waitlistEntry) {
        waitlistEntry.status = 'notified';
        await waitlistEntry.save();
        
        await Notification.create({
          recipient: waitlistEntry.commuter,
          type: 'waitlist_availability',
          title: 'A spot just opened up!',
          message: 'A parking slot you were waiting for has become available. Book it quickly before someone else does.',
          relatedEntity: {
            entityType: 'ParkingLot',
            entityId: reservation.parkingLot
          }
        });
        console.log(`[WAITLIST] Notified user ${waitlistEntry.commuter} for lot ${reservation.parkingLot}`);
      }
    } catch (waitlistErr) {
      console.error('Failed to process waitlist trigger:', waitlistErr);
    }

    return successResponse(res, { reservation }, 'Booking cancelled.');
  } catch (error) {
    next(error);
  }
};

// 6. Get My Bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Reservation.countDocuments({ commuter: req.user._id });
    
    const reservations = await Reservation.find({ commuter: req.user._id })
      .populate('parkingLot', 'name address')
      .populate('parkingSlot', 'slotNumber type')
      .populate('vehicle', 'licensePlate make model')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(res, { 
      reservations,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};
