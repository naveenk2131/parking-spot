const User = require('../models/User.model');
const { logAudit, getIp } = require('../services/audit.service');

/**
 * @route  GET /api/users/profile
 * @desc   Get current user profile
 * @access Protected
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

/**
 * @route  PUT /api/users/profile
 * @desc   Update current user profile
 * @access Protected
 */
const updateProfile = async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'businessName'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    logAudit({
      actor: req.user._id,
      action: 'user.profile_updated',
      entity: { entityType: 'User', entityId: req.user._id },
      details: { fields: Object.keys(updates) },
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Profile updated successfully.', data: { user } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/**
 * @route  PUT /api/users/change-password
 * @desc   Change user password
 * @access Protected
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    logAudit({
      actor: req.user._id,
      action: 'user.password_changed',
      entity: { entityType: 'User', entityId: req.user._id },
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

/**
 * @route  GET /api/users (Admin only)
 * @desc   Get all users with pagination
 * @access Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    const filter = { deletedAt: null };
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password -__v').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

/**
 * @route  PUT /api/users/:id/status (Admin only)
 * @desc   Activate or deactivate a user account
 * @access Admin
 */
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    logAudit({
      actor: req.user._id,
      action: isActive ? 'admin.user_activated' : 'admin.user_deactivated',
      entity: { entityType: 'User', entityId: user._id },
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllUsers, updateUserStatus };
