const express = require('express');
const { signUp, signIn, makeAdmin, getAllUsers, verifyEmail, resendOtp } = require('../controllers/user.controllers');
const isAuthentication = require('../utils/isAuthentication');
const router = express.Router();


router.post("/signup", signUp)
router.post("/signin", signIn)
router.patch("/verify-email", verifyEmail)
router.post("/resend-otp", resendOtp)
router.patch("/new-admin/:userId", makeAdmin)
router.get("/all-users", isAuthentication, getAllUsers)
router.get("/user/profile", isAuthentication, getProfile);
router.get(
  "/moderator/reports",
  isAuthentication,
  restrictTo("moderator", "admin"),
  getReports
);

router.delete(
  "/admin/user/:id",
  isAuthentication,
  restrictTo("admin"),
  deleteUser
);
router.post(
  "/admin/promote/:id",
  isAuthentication,
  restrictTo("admin"),
  promoteUser
);


module.exports = router;