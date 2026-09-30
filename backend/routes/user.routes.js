const express = require('express');
const { body, param } = require('express-validator');
const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Current user profile
router.get('/profile', getProfile);
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phone').optional().trim(),
  body('businessName').optional().trim().isLength({ max: 100 }),
], validate, updateProfile);

router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase, one lowercase and one number'),
], validate, changePassword);

// Admin only routes
router.get('/', authorize('admin'), getAllUsers);
router.put('/:id/status', authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
], validate, updateUserStatus);

module.exports = router;
