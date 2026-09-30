const Reservation = require('../models/Reservation.model');
const ParkingLot = require('../models/ParkingLot.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const { successResponse, errorResponse } = require('../utils/response');

exports.getAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const lots = await ParkingLot.find({ owner: ownerId });
    const lotIds = lots.map(l => l._id);

    // Get total slots
    const slots = await ParkingSlot.find({ parkingLot: { $in: lotIds } });
    const totalSlots = slots.length;
    const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
    const reservedSlots = slots.filter(s => s.status === 'reserved').length;
    const occupancyRate = totalSlots > 0 ? (((occupiedSlots + reservedSlots) / totalSlots) * 100).toFixed(1) : 0;

    // Get booking stats
    const allStats = await Reservation.aggregate([
      { $match: { parkingLot: { $in: lotIds } } },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 },
        revenue: { $sum: '$ownerAmount' },
        overstayRevenue: { $sum: '$overstayFee' }
      } }
    ]);

    let totalBookings = 0, noShow = 0, cancel = 0, totalRevenue = 0, overstayRevenue = 0;
    allStats.forEach(s => {
      totalBookings += s.count;
      totalRevenue += (s.revenue || 0);
      overstayRevenue += (s.overstayRevenue || 0);
      if (s._id === 'no_show') noShow += s.count;
      if (s._id === 'cancelled') cancel += s.count;
    });

    const noShowRate = totalBookings > 0 ? ((noShow / totalBookings) * 100).toFixed(1) : 0;
    const cancellationRate = totalBookings > 0 ? ((cancel / totalBookings) * 100).toFixed(1) : 0;

    // Build insights
    const insights = [];
    if (totalSlots === 0) insights.push('No parking slots found. Add slots to start receiving bookings.');
    else if (occupancyRate > 80) insights.push('High occupancy detected. Consider increasing prices during peak hours.');
    else if (occupancyRate < 30) insights.push('Low occupancy detected. Consider running a promotion or lowering base prices.');
    
    if (noShowRate > 10) insights.push('High no-show rate. Consider stricter cancellation policies.');

    res.json({
      success: true,
      data: {
        health: {
          totalSlots,
          occupancyRate,
          noShowRate,
          cancellationRate,
          totalRevenue,
          overstayRevenue
        },
        insights
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminPlatformDashboard = async (req, res, next) => {
  try {
    const User = require('../models/User.model');
    const users = await User.countDocuments({ role: 'commuter' });
    const owners = await User.countDocuments({ role: 'owner' });
    const lots = await ParkingLot.countDocuments();
    const slots = await ParkingSlot.countDocuments();
    const activeBookings = await Reservation.countDocuments({ status: { $in: ['active', 'confirmed'] } });
    const totalBookings = await Reservation.countDocuments();
    
    const financialStats = await Reservation.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
          _id: null,
          gmv: { $sum: '$totalAmount' },
          platformRevenue: { $sum: '$commission' }
      }}
    ]);

    const gmv = financialStats[0]?.gmv || 0;
    const platformRevenue = financialStats[0]?.platformRevenue || 0;

    return successResponse(res, {
      dashboard: {
        users, owners, lots, slots, activeBookings, totalBookings, gmv, platformRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const lots = await ParkingLot.find({ owner: ownerId });
    const lotIds = lots.map(l => l._id);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const getStats = async (startDate) => {
      const stats = await Reservation.aggregate([
        { $match: { parkingLot: { $in: lotIds }, createdAt: { $gte: startDate } } },
        { $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$ownerAmount' },
            avgBookingValue: { $avg: '$ownerAmount' },
            totalDuration: { $sum: { $divide: [{ $subtract: ['$endTime', '$startTime'] }, 3600000] } }
        }}
      ]);
      return stats[0] || { totalBookings: 0, totalRevenue: 0, avgBookingValue: 0, totalDuration: 0 };
    };

    const today = await getStats(todayStart);
    const week = await getStats(weekStart);
    const month = await getStats(monthStart);

    // Get rates
    const allStats = await Reservation.aggregate([
      { $match: { parkingLot: { $in: lotIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    let total = 0, noShow = 0, cancel = 0;
    allStats.forEach(s => {
      total += s.count;
      if (s._id === 'no_show') noShow = s.count;
      if (s._id === 'cancelled') cancel = s.count;
    });

    return successResponse(res, {
      dashboard: {
        today, week, month,
        cancellationRate: total > 0 ? ((cancel/total)*100).toFixed(1) : 0,
        noShowRate: total > 0 ? ((noShow/total)*100).toFixed(1) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getInsights = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const lots = await ParkingLot.find({ owner: ownerId });
    const lotIds = lots.map(l => l._id);

    // Top slots
    const topSlots = await Reservation.aggregate([
      { $match: { parkingLot: { $in: lotIds }, status: 'completed' } },
      { $group: { _id: '$parkingSlot', uses: { $sum: 1 } } },
      { $sort: { uses: -1 } },
      { $limit: 3 },
      { $lookup: { from: 'parkingslots', localField: '_id', foreignField: '_id', as: 'slotData' } },
      { $unwind: '$slotData' },
      { $project: { _id: { slotNumber: '$slotData.slotNumber' }, uses: 1 } }
    ]);

    // Peak hours (hour of startTime)
    const hours = await Reservation.aggregate([
      { $match: { parkingLot: { $in: lotIds } } },
      { $project: { hour: { $hour: '$startTime' } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const peakHour = hours.length > 0 ? hours[0]._id : null;
    
    // EV vs Standard
    const slotTypes = await Reservation.aggregate([
      { $match: { parkingLot: { $in: lotIds } } },
      { $lookup: { from: 'parkingslots', localField: 'parkingSlot', foreignField: '_id', as: 'slotData' } },
      { $unwind: '$slotData' },
      { $group: { _id: '$slotData.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const insights = [];
    if (peakHour !== null) {
      insights.push(`Peak demand occurs around ${peakHour}:00. Consider Peak Pricing during this time.`);
    }
    if (slotTypes.length > 0) {
      insights.push(`Your most booked slot type is ${slotTypes[0]._id}.`);
    }

    return successResponse(res, { insights, topSlots });
  } catch (error) {
    next(error);
  }
};

exports.getOccupancy = async (req, res, next) => {
  try {
    const lotId = req.params.lotId;
    const lot = await ParkingLot.findOne({ _id: lotId, owner: req.user._id });
    if (!lot) return errorResponse(res, 'Lot not found', 404);

    const slots = await ParkingSlot.find({ parkingLot: lotId });
    const total = slots.length;
    let available = 0, occupied = 0, reserved = 0, maintenance = 0;
    
    slots.forEach(s => {
      if (s.status === 'available') available++;
      else if (s.status === 'occupied') occupied++;
      else if (s.status === 'reserved') reserved++;
      else if (s.status === 'maintenance') maintenance++;
    });

    const occupancyPercent = total > 0 ? (((occupied + reserved) / total) * 100).toFixed(1) : 0;

    return successResponse(res, { occupancy: { total, available, occupied, reserved, maintenance, occupancyPercent } });
  } catch (error) {
    next(error);
  }
};

exports.getPricingRecommendation = async (req, res, next) => {
  try {
    const lotId = req.params.lotId;
    const lot = await ParkingLot.findOne({ _id: lotId, owner: req.user._id });
    if (!lot) return errorResponse(res, 'Lot not found', 404);

    const total = lot.totalCapacity || 1;
    const available = lot.availableSlots || 1;
    const occupancyRate = ((total - available) / total) * 100;
    
    let recommendation = 'Pricing is optimal.';
    let demandLevel = 'Normal';
    let suggestedPrice = lot.pricing?.baseRate || 10;

    if (occupancyRate > 80) {
      demandLevel = 'Peak';
      suggestedPrice = suggestedPrice * 1.5;
      recommendation = 'High occupancy detected. Increase rates to maximize revenue.';
    } else if (occupancyRate > 60) {
      demandLevel = 'Moderate';
      suggestedPrice = suggestedPrice * 1.2;
      recommendation = 'Steady demand. Slight increase in pricing recommended.';
    }

    return successResponse(res, { 
      pricing: { 
        currentBasePrice: lot.pricing?.baseRate || 10,
        suggestedPrice,
        demandLevel,
        recommendation
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.processNoShows = async (req, res, next) => {
  try {
    const lotId = req.params.lotId;
    const gracePeriodMinutes = 15;
    const now = new Date();
    
    // Find active reservations that are past the grace period and not checked in
    const lateReservations = await Reservation.find({
      parkingLot: lotId,
      status: 'confirmed', // Haven't checked in yet
      startTime: { $lt: new Date(now.getTime() - gracePeriodMinutes * 60000) }
    });

    for (let r of lateReservations) {
      r.status = 'no_show';
      r.gracePeriodPenalty = r.totalAmount * 0.2; // 20% penalty
      await r.save();
      // Release slot
      await ParkingSlot.findByIdAndUpdate(r.parkingSlot, { status: 'available', currentReservation: null });
      const lot = await ParkingLot.findById(lotId);
      lot.availableSlots += 1;
      await lot.save();
    }

    return successResponse(res, null, `Processed ${lateReservations.length} no-shows.`);
  } catch (error) {
    next(error);
  }
};

exports.processOverstays = async (req, res, next) => {
  try {
    const lotId = req.params.lotId;
    const now = new Date();

    const overstayedReservations = await Reservation.find({
      parkingLot: lotId,
      status: 'active', // Checked in but not checked out
      endTime: { $lt: now }
    }).populate('parkingLot');

    for (let r of overstayedReservations) {
      const hoursOver = (now - r.endTime) / 3600000;
      const rate = r.parkingLot.pricing?.baseRate || 10;
      // Overstay fee is 1.5x normal rate
      r.overstayFee = Math.ceil(hoursOver) * (rate * 1.5);
      await r.save();
    }

    return successResponse(res, null, `Processed ${overstayedReservations.length} overstays.`);
  } catch (error) {
    next(error);
  }
};

exports.simulateOccupancy = async (req, res, next) => {
  // Add quick demo logic
  try {
    const lotId = req.params.lotId;
    const { action } = req.body;
    const slot = await ParkingSlot.findOne({ parkingLot: lotId, status: action === 'enter' ? 'available' : 'occupied' });
    if (!slot) return errorResponse(res, `No ${action === 'enter' ? 'available' : 'occupied'} slots found.`, 404);

    slot.status = action === 'enter' ? 'occupied' : 'available';
    await slot.save();
    
    const lot = await ParkingLot.findById(lotId);
    lot.availableSlots = action === 'enter' ? Math.max(0, lot.availableSlots - 1) : lot.availableSlots + 1;
    await lot.save();

    return successResponse(res, { slot }, `Vehicle simulated ${action}`);
  } catch (error) {
    next(error);
  }
};

exports.simulateRevenue = async (req, res, next) => {
  try {
    const { lotId, scenarioPrice } = req.body;
    
    // Simple simulator: Calculate hypothetical revenue based on past 30 days completed bookings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookings = await Reservation.find({
      parkingLot: lotId,
      status: 'completed',
      createdAt: { $gte: thirtyDaysAgo }
    });

    let currentEstimated = 0;
    let scenarioEstimated = 0;

    bookings.forEach(b => {
      const durationHours = (b.endTime - b.startTime) / (1000 * 60 * 60);
      const currentRate = b.totalAmount / durationHours || 10;
      currentEstimated += currentRate * durationHours;
      scenarioEstimated += scenarioPrice * durationHours;
    });

    return successResponse(res, {
      historicalBookingsCount: bookings.length,
      currentEstimated,
      scenarioEstimated,
      difference: scenarioEstimated - currentEstimated,
      note: 'Scenario estimate based on historical data.'
    });

  } catch (error) {
    next(error);
  }
};
