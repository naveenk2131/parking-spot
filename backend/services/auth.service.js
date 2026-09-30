const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

/**
 * Generate a signed JWT token for the user
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, jwtSecret, { expiresIn: jwtExpiresIn });
};

/**
 * Build the auth response object (token + user)
 */
const buildAuthResponse = (user, token) => ({
  token,
  user: {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    businessName: user.businessName || null,
    isEmailVerified: user.isEmailVerified,
    preferences: user.preferences,
    createdAt: user.createdAt,
  },
});

module.exports = { generateToken, buildAuthResponse };
