// src/server/routes/admin.js
const express = require("express");
const router = express.Router();
const { getLoginLogs } = require("../controllers/adminController");
const { verifyAuditChain } = require("../utils/auditService"); // ✅ import the new service

// Existing route for admin login logs
router.get("/logs", getLoginLogs);

// ✅ New route for audit log verification
router.get("/audit/verify", async (req, res) => {
  try {
    const result = await verifyAuditChain();
    res.status(200).json(result);
  } catch (err) {
    console.error("Audit verification failed:", err);
    res.status(500).json({ error: "Audit verification failed" });
  }
});

module.exports = router;
