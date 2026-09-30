const Review = require('../models/Review.model');
const Reservation = require('../models/Reservation.model');
const ParkingLot = require('../models/ParkingLot.model');
const { successResponse, errorResponse } = require('../utils/response');

exports.createReview = async (req, res, next) => {
  try {
    const { parkingLotId, reservationId, rating, comment } = req.body;

    // Validate the reservation exists, is completed, and belongs to user
    const reservation = await Reservation.findOne({
      _id: reservationId,
      commuter: req.user._id,
      parkingLot: parkingLotId,
      status: 'completed'
    });

    if (!reservation) {
      return errorResponse(res, 'You can only review completed parking sessions.', 403);
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ reservation: reservationId });
    if (existingReview) {
      return errorResponse(res, 'You have already reviewed this booking.', 409);
    }

    const review = await Review.create({
      commuter: req.user._id,
      parkingLot: parkingLotId,
      reservation: reservationId,
      rating,
      comment
    });

    // Update parking lot average rating
    const allReviews = await Review.find({ parkingLot: parkingLotId });
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    
    await ParkingLot.findByIdAndUpdate(parkingLotId, {
      'rating.average': avgRating,
      'rating.count': allReviews.length
    });

    return successResponse(res, { review }, 'Review submitted successfully.', 201);
  } catch (error) {
    next(error);
  }
};

exports.getLotReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ parkingLot: req.params.lotId })
      .populate('commuter', 'firstName lastName')
      .sort({ createdAt: -1 });
    return successResponse(res, { reviews });
  } catch (error) {
    next(error);
  }
};
