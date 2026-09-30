const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createService,
  getLotServices,
  getOwnerServices,
  updateService,
  deleteService,
  getServiceAvailability,
  bookService,
  getMyServiceBookings,
  cancelServiceBooking,
  getServiceAnalytics,
  getOwnerServiceBookings,
  updateBookingStatus,
  getAllActiveServices,
} = require('../controllers/premiumService.controller');

// ── Public / Commuter ────────────────────────────────────────────────────────
// Get all active services globally
router.get('/all', protect, getAllActiveServices);

// Get all services for a parking lot (anyone authenticated can view)
router.get('/lot/:lotId', protect, getLotServices);

// Check availability for a specific service
router.get('/:id/availability', protect, getServiceAvailability);

// Commuter: book a service
router.post('/book', protect, authorize('commuter'), bookService);

// Commuter: my service bookings
router.get('/my-bookings', protect, authorize('commuter'), getMyServiceBookings);

// Commuter: cancel a service booking
router.patch('/bookings/:id/cancel', protect, authorize('commuter'), cancelServiceBooking);

// ── Owner ────────────────────────────────────────────────────────────────────

// Owner: get all their services
router.get('/owner/services', protect, authorize('owner'), getOwnerServices);

// Owner: get analytics
router.get('/owner/analytics', protect, authorize('owner'), getServiceAnalytics);

// Owner: get all service bookings
router.get('/owner/bookings', protect, authorize('owner'), getOwnerServiceBookings);

// Owner: update a booking status (valet lifecycle etc.)
router.patch('/owner/bookings/:id/status', protect, authorize('owner'), updateBookingStatus);

// Owner: create a service for a lot
router.post('/lot/:parkingLotId', protect, authorize('owner'), createService);

// Owner: update or deactivate a service
router.put('/:id', protect, authorize('owner'), updateService);
router.delete('/:id', protect, authorize('owner'), deleteService);

module.exports = router;
