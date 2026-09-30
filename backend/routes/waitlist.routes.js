const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlist.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// Commuter Waitlist Routes
router.post('/join', authorize('commuter', 'admin'), waitlistController.joinWaitlist);
router.get('/my-waitlist', authorize('commuter', 'admin'), waitlistController.getMyWaitlist);

module.exports = router;
