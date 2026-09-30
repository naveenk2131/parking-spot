const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('commuter'), reviewController.createReview);
router.get('/lot/:lotId', reviewController.getLotReviews);

module.exports = router;
