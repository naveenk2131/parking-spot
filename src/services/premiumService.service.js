import api from './api';

const premiumService = {
  // Get all services for a parking lot
  getLotServices: (lotId) => api.get(`/premium-services/lot/${lotId}`),

  // Get all active services globally
  getAllActiveServices: () => api.get('/premium-services/all'),

  // Check availability
  checkAvailability: (id, startTime, endTime) =>
    api.get(`/premium-services/${id}/availability`, { params: { startTime, endTime } }),

  // Book a service
  bookService: (data) => api.post('/premium-services/book', data),

  // Get commuter's bookings
  getMyBookings: () => api.get('/premium-services/my-bookings'),

  // Cancel a booking
  cancelBooking: (id, reason) => api.patch(`/premium-services/bookings/${id}/cancel`, { reason }),

  // Owner: get own services
  getOwnerServices: () => api.get('/premium-services/owner/services'),

  // Owner: analytics
  getAnalytics: () => api.get('/premium-services/owner/analytics'),

  // Owner: service bookings
  getOwnerBookings: () => api.get('/premium-services/owner/bookings'),

  // Owner: update booking status
  updateBookingStatus: (id, status) =>
    api.patch(`/premium-services/owner/bookings/${id}/status`, { status }),

  // Owner: create service
  createService: (lotId, data) => api.post(`/premium-services/lot/${lotId}`, data),

  // Owner: update service
  updateService: (id, data) => api.put(`/premium-services/${id}`, data),

  // Owner: deactivate service
  deleteService: (id) => api.delete(`/premium-services/${id}`),
};

export default premiumService;
