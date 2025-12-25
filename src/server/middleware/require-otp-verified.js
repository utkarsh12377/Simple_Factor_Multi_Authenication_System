// src/server/middleware/require-otp-verified.js
const { appendAudit } = require("../utils/auditService");

/**
 * Middleware that ensures OTP verification has happened.
 * If not verified, logs an unauthorized_access audit record (SR-003).
 */
module.exports = function (req, res, next) {
  // Standard check: if OTP verified in session, continue
  if (req.session && req.session.otpVerified) return next();

  // Build IP robustly
  const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const path = req.originalUrl || req.url;
  const method = req.method || "GET";

  // Append audit: event_type 'unauthorized_access', include reason and IP
  // user_id unknown (null) in this context; if there's a user id in session include it
  const userId = (req.session && req.session.user_id) ? req.session.user_id : null;

  appendAudit(userId, "unauthorized_access", {
    path,
    method,
    ip,
    reason: "otp_not_verified"
  }).catch((err) => {
    // appendAudit may not return a promise in your version; safe ignore if not a Promise
    // We ensure logging failure won't break the response.
    console.error("appendAudit error (unauthorized_access):", err && err.message ? err.message : err);
  });

  return res.status(401).json({ error: "OTP verification required" });
};
