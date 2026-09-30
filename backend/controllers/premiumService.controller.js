const { v4: uuidv4 } = require('uuid');
const PremiumService = require('../models/PremiumService.model');
const ServiceBooking = require('../models/ServiceBooking.model');
const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/response');

// ─── HELPERS ────────────────────────────────────────────────────────────────

const isWithinOperatingHours = (service, startTime) => {
  if (service.operatingHours.is24Hours) return true;
  const date = new Date(startTime);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const t = `${h}:${m}`;
  return t >= service.operatingHours.open && t <= service.operatingHours.close;
};

const getBookedCount = async (serviceId, startTime, endTime) => {
  return ServiceBooking.countDocuments({
    premiumService: serviceId,
    status: { $in: ['confirmed', 'in_progress', 'vehicle_received', 'parked'] },
    $or: [{ startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }],
  });
};

// ─── OWNER: CRUD ─────────────────────────────────────────────────────────────

exports.createService = async (req, res, next) => {
  try {
    const { parkingLotId } = req.params;
    const service = await PremiumService.create({
      ...req.body,
      parkingLot: parkingLotId,
      owner: req.user._id,
    });
    return successResponse(res, { service }, 'Service created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

exports.getLotServices = async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const services = await PremiumService.find({ parkingLot: lotId }).sort({ serviceType: 1 });
    return successResponse(res, { services });
  } catch (err) {
    next(err);
  }
};

exports.getOwnerServices = async (req, res, next) => {
  try {
    const services = await PremiumService.find({ owner: req.user._id })
      .populate('parkingLot', 'name address')
      .sort({ createdAt: -1 });
    return successResponse(res, { services });
  } catch (err) {
    next(err);
  }
};

exports.getAllActiveServices = async (req, res, next) => {
  try {
    const services = await PremiumService.find({ status: 'ACTIVE' })
      .populate('parkingLot', 'name address location images')
      .sort({ createdAt: -1 });
    return successResponse(res, { services });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await PremiumService.findOne({ _id: req.params.id, owner: req.user._id });
    if (!service) return errorResponse(res, 'Service not found or access denied.', 404);
    Object.assign(service, req.body);
    await service.save();
    return successResponse(res, { service }, 'Service updated.');
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await PremiumService.findOne({ _id: req.params.id, owner: req.user._id });
    if (!service) return errorResponse(res, 'Service not found or access denied.', 404);
    service.status = 'INACTIVE';
    service.isActive = false;
    await service.save();
    return successResponse(res, {}, 'Service deactivated.');
  } catch (err) {
    next(err);
  }
};

// ─── COMMUTER: AVAILABILITY + BOOKING ────────────────────────────────────────

exports.getServiceAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) return errorResponse(res, 'startTime and endTime are required.', 400);

    const service = await PremiumService.findById(id);
    if (!service || service.status !== 'ACTIVE') {
      return errorResponse(res, 'Service is not available.', 404);
    }

    const booked = await getBookedCount(id, startTime, endTime);
    const available = service.capacity - booked;

    return successResponse(res, {
      available: available > 0,
      capacity: service.capacity,
      booked,
      remaining: Math.max(0, available),
      withinOperatingHours: isWithinOperatingHours(service, startTime),
    });
  } catch (err) {
    next(err);
  }
};

exports.bookService = async (req, res, next) => {
  try {
    const { serviceId, startTime, endTime, vehicleId, reservationId, selectedPackage } = req.body;

    const service = await PremiumService.findById(serviceId).populate('parkingLot');
    if (!service) return errorResponse(res, 'Service not found.', 404);
    if (service.status !== 'ACTIVE') return errorResponse(res, 'This service is currently unavailable.', 400);
    if (!service.isActive) return errorResponse(res, 'Service is inactive.', 400);

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) return errorResponse(res, 'End time must be after start time.', 400);

    if (!isWithinOperatingHours(service, start)) {
      return errorResponse(res, `This service is only available from ${service.operatingHours.open} to ${service.operatingHours.close}.`, 400);
    }

    const booked = await getBookedCount(serviceId, startTime, endTime);
    if (booked >= service.capacity) {
      return errorResponse(res, 'No availability for this time slot. Please choose a different time.', 409);
    }

    // Calculate amount
    let amount = service.price;
    if (service.serviceType === 'CAR_WASH' && selectedPackage) {
      const pkg = service.carWashConfig?.packages?.find(p => p.name === selectedPackage.name);
      if (pkg) amount = pkg.price;
    }

    const commissionRate = service.parkingLot?.commissionRate || 0.12;
    const commission = amount * commissionRate;
    const ownerAmount = amount - commission;
    const passCode = `SVC-${uuidv4().substring(0, 10).toUpperCase()}`;

    const booking = await ServiceBooking.create({
      commuter: req.user._id,
      premiumService: serviceId,
      parkingLot: service.parkingLot._id,
      reservation: reservationId || null,
      vehicle: vehicleId || null,
      serviceType: service.serviceType,
      startTime: start,
      endTime: end,
      status: 'confirmed',
      paymentStatus: 'paid',
      amount,
      commission,
      ownerAmount,
      selectedPackage: selectedPackage || undefined,
      passCode,
    });

    // Notify user
    try {
      await Notification.create({
        recipient: req.user._id,
        type: 'booking_confirmed',
        title: `${service.name} Booking Confirmed`,
        message: `Your ${service.serviceType.replace('_', ' ').toLowerCase()} booking has been confirmed. Pass: ${passCode}`,
        relatedEntity: { entityType: 'PremiumService', entityId: service._id },
      });
    } catch (_) {}

    return successResponse(res, { booking }, 'Service booked successfully.', 201);
  } catch (err) {
    next(err);
  }
};

exports.getMyServiceBookings = async (req, res, next) => {
  try {
    const bookings = await ServiceBooking.find({ commuter: req.user._id })
      .populate('premiumService', 'name serviceType price pricingType')
      .populate('parkingLot', 'name address')
      .populate('vehicle', 'vehicleNumber brand model')
      .sort({ createdAt: -1 });
    return successResponse(res, { bookings });
  } catch (err) {
    next(err);
  }
};

exports.cancelServiceBooking = async (req, res, next) => {
  try {
    const booking = await ServiceBooking.findOne({ _id: req.params.id, commuter: req.user._id });
    if (!booking) return errorResponse(res, 'Booking not found.', 404);
    if (['completed', 'cancelled'].includes(booking.status)) {
      return errorResponse(res, 'Cannot cancel a completed or already cancelled booking.', 400);
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User requested';
    booking.paymentStatus = 'refunded';
    await booking.save();

    try {
      await Notification.create({
        recipient: req.user._id,
        type: 'general',
        title: 'Service Booking Cancelled',
        message: 'Your service booking has been cancelled and refund has been initiated.',
        relatedEntity: { entityType: 'PremiumService', entityId: booking.premiumService },
      });
    } catch (_) {}

    return successResponse(res, { booking }, 'Booking cancelled.');
  } catch (err) {
    next(err);
  }
};

// ─── OWNER: ANALYTICS ───────────────────────────────────────────────────────

exports.getServiceAnalytics = async (req, res, next) => {
  try {
    const myServices = await PremiumService.find({ owner: req.user._id }).select('_id');
    const serviceIds = myServices.map(s => s._id);

    const [revenueData, bookingsByType, recent] = await Promise.all([
      ServiceBooking.aggregate([
        { $match: { premiumService: { $in: serviceIds }, paymentStatus: 'paid' } },
        { $group: {
          _id: '$serviceType',
          totalRevenue: { $sum: '$amount' },
          ownerRevenue: { $sum: '$ownerAmount' },
          bookings: { $sum: 1 },
        }},
      ]),
      ServiceBooking.aggregate([
        { $match: { premiumService: { $in: serviceIds } } },
        { $group: { _id: '$serviceType', count: { $sum: 1 } } },
      ]),
      ServiceBooking.find({ premiumService: { $in: serviceIds } })
        .populate('premiumService', 'name serviceType')
        .populate('commuter', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totalRevenue = revenueData.reduce((acc, r) => acc + r.totalRevenue, 0);

    return successResponse(res, { revenueData, bookingsByType, recent, totalRevenue });
  } catch (err) {
    next(err);
  }
};

// ─── OWNER: SERVICE BOOKINGS MANAGEMENT ─────────────────────────────────────

exports.getOwnerServiceBookings = async (req, res, next) => {
  try {
    const myServices = await PremiumService.find({ owner: req.user._id }).select('_id');
    const serviceIds = myServices.map(s => s._id);

    const bookings = await ServiceBooking.find({ premiumService: { $in: serviceIds } })
      .populate('premiumService', 'name serviceType')
      .populate('commuter', 'firstName lastName email')
      .populate('vehicle', 'vehicleNumber brand model')
      .sort({ createdAt: -1 });

    return successResponse(res, { bookings });
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const myServices = await PremiumService.find({ owner: req.user._id }).select('_id');
    const serviceIds = myServices.map(s => s._id);

    const booking = await ServiceBooking.findOne({
      _id: req.params.id,
      premiumService: { $in: serviceIds },
    });
    if (!booking) return errorResponse(res, 'Booking not found.', 404);

    booking.status = req.body.status;
    await booking.save();

    return successResponse(res, { booking }, 'Booking status updated.');
  } catch (err) {
    next(err);
  }
};
