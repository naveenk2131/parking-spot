const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    commuter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
      unique: true, // Prevent duplicate reviews for the same booking
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    reply: {
      type: String, // Owner's reply
      trim: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ parkingLot: 1, createdAt: -1 });
reviewSchema.index({ commuter: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
