// src/server/routes/otp.routes.js
const express = require("express");
const router = express.Router();

const { requestOtp, verifyOtp } = require("../controllers/otp.controller.js");

// OTP routes
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
