const ParkingLot = require("../models/ParkingLot.model");
const ParkingFloor = require("../models/ParkingFloor.model");
const ParkingSlot = require("../models/ParkingSlot.model");
const { successResponse, errorResponse } = require("../utils/response");

exports.searchParking = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 10000, type, minRating } = req.query;
    const hasCoords = lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));

    let parkingLots = [];

    if (hasCoords) {
      try {
        parkingLots = await ParkingLot.find({
          status: "active",
          location: {
            $near: {
              $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
              $maxDistance: Number(maxDistance)
            }
          }
        }).limit(50).lean();
      } catch (geoErr) {
        console.error("Geo query failed, using fallback:", geoErr.message);
      }
    }

    // Fallback: return all active lots
    if (parkingLots.length === 0) {
      parkingLots = await ParkingLot.find({ status: "active" }).limit(50).lean();
    }

    const enrichedLots = parkingLots.map(lot => {
      let score = 75;
      let reasons = [];
      if (lot.availableSlots > 0) { score += 10; reasons.push("Good availability"); } else { score -= 20; }
      if (hasCoords && lot.location?.coordinates) { score += 10; reasons.push("Close to destination"); }
      if (lot.pricing && lot.pricing.basePrice < 50) { score += 5; reasons.push("Within budget"); }
      if (type === "ev" && lot.amenities?.includes("ev_charging")) { score += 15; reasons.push("EV charging available"); }
      if (lot.isFeatured) { score += 15; reasons.push("Featured Location"); }
      if (lot.isVerified) { score += 5; reasons.push("Verified location"); }
      score = Math.min(score, 99);
      const totalCap = lot.totalCapacity || 1;
      const occupancyPercent = Math.round(((totalCap - (lot.availableSlots || 0)) / totalCap) * 100);
      return { ...lot, occupancyPercent, smartMatch: { score, reasons } };
    });

    enrichedLots.sort((a, b) => b.smartMatch.score - a.smartMatch.score);
    return successResponse(res, { parkingLots: enrichedLots });
  } catch (error) {
    next(error);
  }
};

exports.getParkingDetails = async (req, res, next) => {
  try {
    const lotId = req.params.id;
    const parkingLot = await ParkingLot.findById(lotId).lean();
    if (!parkingLot) return errorResponse(res, "Parking lot not found.", 404);

    const floors = await ParkingFloor.find({ parkingLot: lotId, isActive: true }).sort({ floorNumber: 1 }).lean();
    const slots = await ParkingSlot.find({ parkingLot: lotId, isActive: true }).lean();

    floors.forEach(floor => {
      floor.slots = slots.filter(s => s.floor.toString() === floor._id.toString());
    });

    const availableCount = slots.filter(s => s.status === "available").length;
    parkingLot.liveAvailableSlots = availableCount;
    parkingLot.availableSlots = availableCount;

    return successResponse(res, { parkingLot, floors });
  } catch (error) {
    next(error);
  }
};
