const User = require('../models/User.model');
const { generateToken, buildAuthResponse } = require('../services/auth.service');
const { logAudit, getIp } = require('../services/audit.service');

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, businessName } = req.body;

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Only allow commuter and owner self-registration
    const allowedRoles = ['commuter', 'owner'];
    const assignedRole = allowedRoles.includes(role) ? role : 'commuter';

    const userData = { firstName, lastName, email, password, role: assignedRole, phone };
    if (assignedRole === 'owner' && businessName) {
      userData.businessName = businessName;
    }

    const user = await User.create(userData);

    const token = generateToken(user._id, user.role);

    logAudit({
      actor: user._id,
      action: 'user.registered',
      entity: { entityType: 'User', entityId: user._id },
      details: { role: user.role },
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: buildAuthResponse(user, token),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

/**
 * @route  POST /api/auth/login
 * @desc   Login user
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !user.isActive || user.deletedAt) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logAudit({
        actor: user._id,
        action: 'user.login_failed',
        details: { email },
        ipAddress: getIp(req),
        userAgent: req.headers['user-agent'],
        status: 'failure',
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    logAudit({
      actor: user._id,
      action: 'user.login',
      entity: { entityType: 'User', entityId: user._id },
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: buildAuthResponse(user, token),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

/**
 * @route  GET /api/auth/me
 * @desc   Get current authenticated user
 * @access Protected
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: { user: user.toSafeObject() } });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user.' });
  }
};

/**
 * @route  POST /api/auth/logout
 * @desc   Logout (client-side token removal + audit log)
 * @access Protected
 */
const logout = async (req, res) => {
  logAudit({
    actor: req.user._id,
    action: 'user.logout',
    entity: { entityType: 'User', entityId: req.user._id },
    ipAddress: getIp(req),
    userAgent: req.headers['user-agent'],
  });
  res.json({ success: true, message: 'Logged out successfully.' });
};

module.exports = { register, login, getMe, logout };
