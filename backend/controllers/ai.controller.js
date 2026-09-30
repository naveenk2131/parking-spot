const Reservation = require('../models/Reservation.model');
const ParkingLot = require('../models/ParkingLot.model');
const { successResponse, errorResponse } = require('../utils/response');

exports.askAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userRole = req.user.role; // 'commuter', 'owner', 'admin'
    const lowerMsg = message.toLowerCase();
    
    // MOCK LLM TOOL CALLING (Fallback Provider)
    // In a real application, this would use the Gemini API (e.g. genai.GenerativeModel)
    // with function calling configured for 'lookupBooking', 'findParking', 'getRevenue', etc.

    let reply = "I'm sorry, I couldn't understand that.";

    // COMMUTER INTENTS
    if (userRole === 'commuter') {
      if (lowerMsg.includes('find parking') || lowerMsg.includes('available')) {
        const lots = await ParkingLot.find({ 'address.city': 'San Francisco' }).limit(1); // Demo
        if (lots.length > 0) {
          reply = `I found ${lots[0].name} at ${lots[0].address.street}. It currently has ${lots[0].availableSlots} slots available.`;
        } else {
          reply = "I couldn't find any available parking near your destination right now.";
        }
      } 
      else if (lowerMsg.includes('my current booking') || lowerMsg.includes('where is my')) {
        const booking = await Reservation.findOne({ commuter: req.user._id, status: { $in: ['active', 'confirmed'] } })
          .populate('parkingLot')
          .populate('parkingSlot');
        if (booking) {
          reply = `Your current booking is at ${booking.parkingLot.name}. You are assigned Slot ${booking.parkingSlot.slotNumber}.`;
        } else {
          reply = "You don't have any active bookings at the moment.";
        }
      }
      else if (lowerMsg.includes('extend')) {
        reply = "To extend your booking, go to 'My Bookings', find your active booking, and click 'Extend'. The system will check if the slot is available for the next time block before confirming.";
      }
      else if (lowerMsg.includes('how much') || lowerMsg.includes('pay') || lowerMsg.includes('cheaper')) {
        reply = "Prices vary by lot, but typically range from $10 to $20 per hour. Peak pricing may apply during busy hours. You can see exact pricing when selecting a lot.";
      }
      else if (lowerMsg.includes('check in')) {
        reply = "When you arrive, present your Digital Pass (QR Code) from the 'Booking Success' page to the parking attendant or scanner at the entry gate.";
      }
      else {
        reply = "I can help you find parking, check your booking status, or explain how to extend your time. How can I assist?";
      }
    }
    
    // OWNER INTENTS
    else if (userRole === 'owner') {
      if (lowerMsg.includes('revenue') || lowerMsg.includes('make')) {
        const stats = await Reservation.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$ownerAmount' } } }
        ]);
        const total = stats[0]?.total || 0;
        reply = `Your total settled revenue to date is $${total.toFixed(2)}. Check the Revenue Simulator to see projected earnings.`;
      }
      else if (lowerMsg.includes('busiest') || lowerMsg.includes('peak')) {
        reply = "Based on historical aggregation, your busiest hour is generally 18:00 (6 PM). Consider enabling Peak Pricing during this time to optimize revenue.";
      }
      else if (lowerMsg.includes('underutilized') || lowerMsg.includes('low utilization')) {
        reply = "Level B and standard non-covered slots typically have lower utilization compared to Premium and EV slots.";
      }
      else if (lowerMsg.includes('no-show') || lowerMsg.includes('happened today')) {
        reply = "Today's metrics show a 2% no-show rate. You can run the No-Show check in your Revenue dashboard to automatically clear those slots.";
      }
      else {
        reply = "As your Operations Assistant, I can fetch revenue stats, identify underutilized inventory, and provide pricing recommendations based on your MongoDB data.";
      }
    }

    // ADMIN INTENTS
    else if (userRole === 'admin') {
      if (lowerMsg.includes('platform revenue')) {
        const stats = await Reservation.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$commission' } } }
        ]);
        const total = stats[0]?.total || 0;
        reply = `The platform has generated $${total.toFixed(2)} in commission revenue so far.`;
      }
      else if (lowerMsg.includes('active bookings') || lowerMsg.includes('volume')) {
        const active = await Reservation.countDocuments({ status: 'active' });
        reply = `There are currently ${active} active bookings across the platform.`;
      }
      else {
        reply = "I can provide high-level platform metrics like total generated commission, active bookings, and system health.";
      }
    }

    return successResponse(res, { reply });
  } catch (error) {
    next(error);
  }
};
