const AuditLog = require('../models/AuditLog.model');

/**
 * Log an audit event (non-blocking - errors are swallowed to not disrupt main flow)
 */
const logAudit = async ({ actor, action, entity, details, ipAddress, userAgent, status = 'success' }) => {
  try {
    await AuditLog.create({ actor, action, entity, details, ipAddress, userAgent, status });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

/**
 * Extract IP from request
 */
const getIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
};

module.exports = { logAudit, getIp };
