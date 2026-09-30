const express = require('express');
const { body, param } = require('express-validator');
const {
  getMyVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicle.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyVehicles)
  .post([
    body('licensePlate').trim().notEmpty().withMessage('License plate is required')
      .isLength({ max: 20 }).withMessage('License plate too long'),
    body('type').isIn(['sedan', 'suv', 'truck', 'motorcycle', 'van', 'other', 'car']).withMessage('Invalid vehicle type'),
    body('make').notEmpty().withMessage('Make is required').trim(),
    body('model').optional().trim(),
    body('color').optional().trim(),
    body('year').optional().isInt({ min: 1990 }).withMessage('Invalid year'),
    body('isDefault').optional().isBoolean(),
  ], validate, addVehicle);

router.route('/:id')
  .put([
    param('id').isMongoId().withMessage('Invalid vehicle ID'),
    body('type').optional().isIn(['sedan', 'suv', 'truck', 'motorcycle', 'van', 'other', 'car']).withMessage('Invalid vehicle type'),
    body('make').optional().trim(),
    body('model').optional().trim(),
    body('color').optional().trim(),
    body('year').optional().isInt({ min: 1990 }).withMessage('Invalid year'),
    body('isDefault').optional().isBoolean(),
  ], validate, updateVehicle)
  .delete([
    param('id').isMongoId().withMessage('Invalid vehicle ID'),
  ], validate, deleteVehicle);


module.exports = router;
