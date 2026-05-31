const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      // e.g. "FAILED_LOGIN", "FORBIDDEN_ACCESS", "ACCOUNT_DELETED"
      type: String,
      required: true,
      enum: [
        "FAILED_LOGIN",
        "ACCOUNT_LOCKED",
        "FORBIDDEN_ACCESS",
        "ACCOUNT_DELETED",
        "PROMOTE_USER",
      ],
    },
    user: {
      // The user involved (email or id — stored as string so we can log even non-existent users)
      type: String,
      default: "unknown",
    },
    performedBy: {
      // Who triggered the action (e.g. admin who deleted a user)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    details: {
      // Extra context about the event
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;
