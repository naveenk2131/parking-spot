const Vehicle = require('../models/Vehicle.model');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Get user's vehicles
// @route   GET /api/v1/vehicles
// @access  Private
exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return successResponse(res, { vehicles });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Server error', 500);
  }
};

// @desc    Add a vehicle
// @route   POST /api/v1/vehicles
// @access  Private
exports.addVehicle = async (req, res) => {
  try {
    const { licensePlate, type, make, model, color, year, isDefault } = req.body;

    // Check if vehicle with same number exists for this user
    const exists = await Vehicle.findOne({ owner: req.user._id, licensePlate: licensePlate.trim().toUpperCase() });
    if (exists) {
      return errorResponse(res, 'Vehicle with this number is already registered to you', 400);
    }

    // If this is set to default, unset other defaults
    if (isDefault) {
      await Vehicle.updateMany({ owner: req.user._id }, { isDefault: false });
    }

    const vehicleCount = await Vehicle.countDocuments({ owner: req.user._id });
    const setAsDefault = isDefault || vehicleCount === 0;

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      licensePlate: licensePlate.trim().toUpperCase(),
      type: type,
      make: make?.trim() || 'Unknown',
      model: model?.trim() || 'Unknown',
      color: color?.trim(),
      year: year || new Date().getFullYear(),
      isDefault: setAsDefault
    });

    return successResponse(res, { vehicle }, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Server error', 500);
  }
};

// @desc    Update a vehicle
// @route   PUT /api/v1/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    const { type, make, model, color, year, isDefault } = req.body;

    if (isDefault && !vehicle.isDefault) {
      await Vehicle.updateMany({ owner: req.user._id }, { isDefault: false });
    }

    vehicle.type = type || vehicle.type;
    if(make !== undefined) vehicle.make = make.trim();
    if(model !== undefined) vehicle.model = model.trim();
    if(color !== undefined) vehicle.color = color.trim();
    if(year !== undefined) vehicle.year = year;
    if(isDefault !== undefined) vehicle.isDefault = isDefault;

    await vehicle.save();
    return successResponse(res, { vehicle });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Server error', 500);
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/v1/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    // Check for active reservations
    const Reservation = require('../models/Reservation.model');
    const activeBooking = await Reservation.findOne({
      vehicle: vehicle._id,
      status: { $in: ['pending', 'confirmed', 'active'] }
    });

    if (activeBooking) {
      return errorResponse(res, 'Cannot delete vehicle. It is associated with an active reservation.', 400);
    }

    await vehicle.deleteOne();

    // If default was deleted, make another vehicle default
    if (vehicle.isDefault) {
      const nextVehicle = await Vehicle.findOne({ owner: req.user._id });
      if (nextVehicle) {
        nextVehicle.isDefault = true;
        await nextVehicle.save();
      }
    }

    return successResponse(res, {});
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Server error', 500);
  }
};
