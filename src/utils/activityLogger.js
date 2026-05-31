const ActivityLog = require("../models/activityLog.models");

/**
 * Log a suspicious or notable activity to MongoDB.
 *
 * @param {Object} params
 * @param {string} params.action        - One of the enum values in ActivityLog model
 * @param {string} [params.user]        - Email or identifier of the involved user
 * @param {string} [params.ipAddress]   - IP address of the request
 * @param {string} [params.details]     - Extra context
 * @param {string} [params.performedBy] - ObjectId of admin/moderator who acted
 */
const logActivity = async ({ action, user, ipAddress, details, performedBy }) => {
  try {
    await ActivityLog.create({
      action,
      user: user || "unknown",
      ipAddress: ipAddress || "unknown",
      details: details || "",
      performedBy: performedBy || null,
    });
  } catch (err) {
    // Logging should never crash the app
    console.error("Failed to write activity log:", err.message);
  }
};

module.exports = { logActivity };
