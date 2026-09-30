const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('owner', 'admin'));

router.get('/health', analyticsController.getAnalytics);
router.get('/dashboard', analyticsController.getDashboard);
router.get('/admin-dashboard', analyticsController.getAdminPlatformDashboard);
router.get('/insights', analyticsController.getInsights);
router.get('/:lotId/occupancy', analyticsController.getOccupancy);
router.get('/:lotId/pricing-recommendation', analyticsController.getPricingRecommendation);
router.post('/simulate-revenue', analyticsController.simulateRevenue);
router.post('/:lotId/no-shows', analyticsController.processNoShows);
router.post('/:lotId/overstays', analyticsController.processOverstays);
router.post('/:lotId/simulate', analyticsController.simulateOccupancy);

module.exports = router;
