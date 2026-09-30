const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// Commuter Routes
router.post('/', authorize('commuter', 'admin'), bookingController.createBooking);
router.post('/:id/pay', authorize('commuter', 'admin'), bookingController.processDemoPayment);
router.post('/:id/extend', authorize('commuter', 'admin'), bookingController.extendBooking);
router.post('/:id/cancel', authorize('commuter', 'admin'), bookingController.cancelBooking);
router.get('/my-bookings', authorize('commuter', 'admin'), bookingController.getMyBookings);

// Owner/Admin Routes (Check-in)
router.post('/check-in', authorize('owner', 'admin'), bookingController.verifyAndCheckIn);

module.exports = router;
