const ParkingLot = require('../models/ParkingLot.model');
const ParkingFloor = require('../models/ParkingFloor.model');
const ParkingSlot = require('../models/ParkingSlot.model');
const Reservation = require('../models/Reservation.model');
const { successResponse, errorResponse } = require('../utils/response');

/** PARKING LOTS */

exports.createParkingLot = async (req, res, next) => {
  try {
    const body = req.body;
    const data = { ...body, owner: req.user._id };

    // Handle flat address fields from form (street, city, state, postalCode, country)
    if (!body.address && (body.street || body.city)) {
      data.address = {
        street: body.street || '',
        city: body.city || '',
        state: body.state || '',
        postalCode: body.postalCode || '',
        country: body.country || 'India',
      };
      // Remove flat fields to avoid schema issues
      delete data.street; delete data.city; delete data.state;
      delete data.postalCode; delete data.country;
    }

    // Process coordinates if provided as flat lat/lng
    if (body.lat && body.lng) {
      data.location = {
        type: 'Point',
        coordinates: [Number(body.lng), Number(body.lat)]
      };
      delete data.lat; delete data.lng;
    }

    // Default status to active so lots appear in search immediately
    if (!data.status) data.status = 'active';

    // availableSlots defaults to totalCapacity when creating
    if (!data.availableSlots && data.totalCapacity) {
      data.availableSlots = Number(data.totalCapacity);
    }

    const parkingLot = await ParkingLot.create(data);
    return successResponse(res, { parkingLot }, 'Parking lot created successfully.', 201);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return errorResponse(res, messages, 400);
    }
    next(error);
  }
};

exports.getOwnerParkingLots = async (req, res, next) => {
  try {
    const parkingLots = await ParkingLot.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, { parkingLots });
  } catch (error) {
    next(error);
  }
};

exports.getParkingLot = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) return errorResponse(res, 'Parking lot not found.', 404);
    return successResponse(res, { parkingLot });
  } catch (error) {
    next(error);
  }
};

exports.updateParkingLot = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findOne({ _id: req.params.id, owner: req.user._id });
    if (!parkingLot) return errorResponse(res, 'Parking lot not found or unauthorized.', 404);

    const updateData = { ...req.body };
    if (req.body.lng && req.body.lat) {
      updateData.location = {
        type: 'Point',
        coordinates: [Number(req.body.lng), Number(req.body.lat)]
      };
    }

    Object.assign(parkingLot, updateData);
    await parkingLot.save();
    return successResponse(res, { parkingLot }, 'Parking lot updated successfully.');
  } catch (error) {
    next(error);
  }
};

exports.deactivateParkingLot = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status: 'inactive' },
      { new: true }
    );
    if (!parkingLot) return errorResponse(res, 'Parking lot not found or unauthorized.', 404);
    return successResponse(res, { parkingLot }, 'Parking lot deactivated.');
  } catch (error) {
    next(error);
  }
};

/** PARKING FLOORS */

exports.createFloor = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findOne({ _id: req.body.parkingLot, owner: req.user._id });
    if (!parkingLot) return errorResponse(res, 'Parking lot not found or unauthorized.', 404);

    const floor = await ParkingFloor.create(req.body);
    return successResponse(res, { floor }, 'Floor created.', 201);
  } catch (error) {
    next(error);
  }
};

exports.getFloors = async (req, res, next) => {
  try {
    const lotId = req.params.lotId || req.params.id;
    const floors = await ParkingFloor.find({ parkingLot: lotId }).sort({ floorNumber: 1 });
    return successResponse(res, { floors });
  } catch (error) {
    next(error);
  }
};

exports.updateFloor = async (req, res, next) => {
  try {
    const floor = await ParkingFloor.findById(req.params.id).populate('parkingLot');
    if (!floor || floor.parkingLot.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Floor not found or unauthorized.', 404);
    }
    
    Object.assign(floor, req.body);
    await floor.save();
    return successResponse(res, { floor }, 'Floor updated.');
  } catch (error) {
    next(error);
  }
};

/** PARKING SLOTS */

exports.createSlot = async (req, res, next) => {
  try {
    const floor = await ParkingFloor.findById(req.body.floor).populate('parkingLot');
    if (!floor || floor.parkingLot.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Floor not found or unauthorized.', 404);
    }

    req.body.parkingLot = floor.parkingLot._id;
    const slot = await ParkingSlot.create(req.body);

    // Update counts
    floor.totalSlots += 1;
    if (slot.status === 'available') floor.availableSlots += 1;
    await floor.save();

    const lot = floor.parkingLot;
    lot.totalCapacity += 1;
    if (slot.status === 'available') lot.availableSlots += 1;
    await lot.save();

    return successResponse(res, { slot }, 'Slot created.', 201);
  } catch (error) {
    next(error);
  }
};

exports.getSlots = async (req, res, next) => {
  try {
    const slots = await ParkingSlot.find({ floor: req.params.floorId }).sort({ slotNumber: 1 });
    return successResponse(res, { slots });
  } catch (error) {
    next(error);
  }
};

exports.updateSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id).populate('parkingLot');
    if (!slot || slot.parkingLot.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Slot not found or unauthorized.', 404);
    }

    const oldStatus = slot.status;
    Object.assign(slot, req.body);
    await slot.save();

    // Re-calc available counts if status changed
    if (oldStatus !== slot.status) {
      const lot = await ParkingLot.findById(slot.parkingLot._id);
      const floor = await ParkingFloor.findById(slot.floor);

      if (oldStatus === 'available' && slot.status !== 'available') {
        lot.availableSlots = Math.max(0, lot.availableSlots - 1);
        floor.availableSlots = Math.max(0, floor.availableSlots - 1);
      } else if (oldStatus !== 'available' && slot.status === 'available') {
        lot.availableSlots += 1;
        floor.availableSlots += 1;
      }
      await lot.save();
      await floor.save();
      
      // SPOT RECOVERY LOGIC
      if (['maintenance', 'occupied'].includes(slot.status)) {
        // Find any upcoming or active reservations for this slot
        const now = new Date();
        const affectedReservations = await Reservation.find({
          parkingSlot: slot._id,
          status: { $in: ['pending', 'confirmed', 'active'] },
          endTime: { $gt: now }
        });

        if (affectedReservations.length > 0) {
          console.log(`[SPOT RECOVERY] Triggered for slot ${slot.slotNumber}`);
          for (const resv of affectedReservations) {
            // Find an alternative available slot
            const altSlot = await ParkingSlot.findOne({
              parkingLot: slot.parkingLot._id,
              status: 'available',
              _id: { $ne: slot._id }
            });

            if (altSlot) {
              console.log(`[SPOT RECOVERY] Reassigning reservation ${resv._id} to slot ${altSlot.slotNumber}`);
              resv.parkingSlot = altSlot._id;
              resv.spotRecoveryApplied = true;
              resv.recoveryNote = `Reassigned from ${slot.slotNumber} due to ${slot.status}`;
              await resv.save();
              
              // Optionally mark alternative slot as reserved
              altSlot.status = 'reserved';
              await altSlot.save();
            } else {
              console.log(`[SPOT RECOVERY] No alternative slots found for reservation ${resv._id}`);
              // Realistically we'd refund and cancel here, or notify admin
            }
          }
        }
      }
    }

    return successResponse(res, { slot }, 'Slot updated.');
  } catch (error) {
    next(error);
  }
};
