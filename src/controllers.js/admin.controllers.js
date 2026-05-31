const User = require("../models/user.models");
const { logActivity } = require("../utils/activityLogger");

// ─────────────────────────────────────────────────────────────────
// DELETE USER  (admin only, cannot self-delete)
// ─────────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id.toString();

  try {
    // Admins cannot delete themselves
    if (id === adminId) {
      return res.status(403).json({ message: "You cannot delete your own account." });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);

    await logActivity({
      action: "ACCOUNT_DELETED",
      user: target.email,
      ipAddress: req.ip,
      performedBy: req.user._id,
      details: `Admin deleted account of ${target.email} (role: ${target.role})`,
    });

    return res.status(200).json({
      message: `User ${target.email} has been deleted successfully.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────
// PROMOTE USER  (admin only, cannot promote another admin)
// ─────────────────────────────────────────────────────────────────
const promoteUser = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // expected: "moderator" or "admin"

  try {
    if (!role || !["moderator", "admin"].includes(role)) {
      return res.status(400).json({ message: 'role must be either "moderator" or "admin"' });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    // Admins cannot promote another admin (the Bonus Twist rule)
    if (target.role === "admin") {
      return res.status(403).json({ message: "Cannot promote another admin." });
    }

    if (target.role === role) {
      return res.status(400).json({ message: `User is already a ${role}` });
    }

    target.role = role;
    await target.save();

    await logActivity({
      action: "PROMOTE_USER",
      user: target.email,
      ipAddress: req.ip,
      performedBy: req.user._id,
      details: `Admin promoted ${target.email} to ${role}`,
    });

    return res.status(200).json({
      message: `${target.email} has been promoted to ${role}.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET ALL USERS  (admin only)
// ─────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry");
    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { deleteUser, promoteUser, getAllUsers };
