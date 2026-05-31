const ActivityLog = require("../models/activityLog.models");

// ─────────────────────────────────────────────────────────────────
// GET REPORTS  (moderator + admin)
// ─────────────────────────────────────────────────────────────────
const getReports = async (req, res) => {
  try {
    // Returns recent suspicious activity logs as "reports"
    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("performedBy", "fullName email role");

    return res.status(200).json({
      message: "Reports fetched successfully",
      count: logs.length,
      reports: logs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getReports };
