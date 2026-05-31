const { logActivity } = require("../utils/activityLogger");

/**
 * Restrict access to specific roles.
 * Usage: restrictTo("admin", "moderator")
 */
const restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Log the forbidden access attempt
      await logActivity({
        action: "FORBIDDEN_ACCESS",
        user: req.user?.email || "unknown",
        ipAddress: req.ip,
        details: `Attempted to access ${req.method} ${req.originalUrl} with role: ${req.user?.role || "none"}`,
      });

      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = restrictTo;
