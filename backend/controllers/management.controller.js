const Reservation = require('../models/Reservation.model');
const ParkingLot = require('../models/ParkingLot.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const { successResponse, errorResponse } = require('../utils/response');

// 1. Process No-Shows (Simulated or triggered)
exports.processNoShows = async (req, res, next) => {
  try {
    const lotId = req.params.lotId;
    const lot = await ParkingLot.findOne({ _id: lotId, owner: req.user._id });
    if (!lot) return errorResponse(res, 'Lot not found', 404);

    const gracePeriod = lot.gracePeriodMinutes || 15;
    const graceMs = gracePeriod * 60000;
    const now = new Date();

    // Find all confirmed reservations that are past their start time + grace period
    const noShowReservations = await Reservation.find({
      parkingLot: lotId,
      status: 'confirmed',
      startTime: { $lt: new Date(now.getTime() - graceMs) }
    });

    let count = 0;
    for (const resv of noShowReservations) {
      resv.status = 'no_show';
      resv.gracePeriodPenalty = resv.totalAmount * 0.5; // Example 50% penalty
      await resv.save();
      count++;
    }

    return successResponse(res, { count }, `Processed ${count} no-shows.`);
  } catch (error) {
    next(error);
  }
};

// 2. Process Overstays
exports.processOverstays = async (req, res, next) => {
  try {
    const lotId = req.params.lotId;
    const lot = await ParkingLot.findOne({ _id: lotId, owner: req.user._id });
    if (!lot) return errorResponse(res, 'Lot not found', 404);

    const now = new Date();

    // Active reservations past their end time
    const overstayReservations = await Reservation.find({
      parkingLot: lotId,
      status: 'active',
      endTime: { $lt: now }
    });

    let count = 0;
    for (const resv of overstayReservations) {
      const overstayMs = now.getTime() - resv.endTime.getTime();
      const overstayHours = Math.ceil(overstayMs / 3600000);
      const overstayFee = overstayHours * (lot.pricing?.basePrice || 10) * 1.5; // 1.5x penalty rate

      resv.overstayFee = overstayFee;
      await resv.save();
      count++;
    }

    return successResponse(res, { count }, `Processed ${count} overstays. Fees updated.`);
  } catch (error) {
    next(error);
  }
};
