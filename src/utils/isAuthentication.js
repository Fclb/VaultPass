const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const { logActivity } = require("../utils/activityLogger");

const isAuthentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    // Distinguish between expired and invalid tokens for clearer error messages
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please sign in again." });
    }
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = isAuthentication;
