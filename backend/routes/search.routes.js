const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Public or commuter routes
router.get('/', searchController.searchParking);
router.get('/:id', searchController.getParkingDetails);

module.exports = router;
