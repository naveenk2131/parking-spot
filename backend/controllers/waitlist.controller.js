const Waitlist = require('../models/Waitlist.model');
const ParkingLot = require('../models/ParkingLot.model');
const { successResponse, errorResponse } = require('../utils/response');

// 1. Join Waitlist
exports.joinWaitlist = async (req, res, next) => {
  try {
    const { parkingLotId, requestedDate, requestedStartTime, requestedDuration, vehicleId, preferences } = req.body;

    const lot = await ParkingLot.findById(parkingLotId);
    if (!lot) return errorResponse(res, 'Parking lot not found', 404);

    const existingEntry = await Waitlist.findOne({
      commuter: req.user._id,
      parkingLot: parkingLotId,
      status: 'waiting',
      requestedDate: new Date(requestedDate)
    });

    if (existingEntry) {
      return errorResponse(res, 'You are already on the waitlist for this date.', 409);
    }

    const waitlistEntry = await Waitlist.create({
      commuter: req.user._id,
      parkingLot: parkingLotId,
      requestedDate: new Date(requestedDate),
      requestedStartTime,
      requestedDuration,
      vehicle: vehicleId,
      preferences: preferences || [],
      status: 'waiting'
    });

    return successResponse(res, { waitlistEntry }, 'Successfully joined the waitlist. We will notify you when a slot becomes available.', 201);
  } catch (error) {
    next(error);
  }
};

// 2. Get My Waitlist
exports.getMyWaitlist = async (req, res, next) => {
  try {
    const waitlist = await Waitlist.find({ commuter: req.user._id })
      .populate('parkingLot', 'name address')
      .sort({ createdAt: -1 });
    
    return successResponse(res, { waitlist });
  } catch (error) {
    next(error);
  }
};
