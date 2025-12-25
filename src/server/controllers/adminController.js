// src/server/controllers/adminController.js
const { connect } = require("../db");

async function getLoginLogs(req, res) {
  try {
    const db = await connect();
    const [rows] = await db.execute(`
      SELECT user_id, email, status, ip_address, created_at
      FROM login_logs
      ORDER BY created_at DESC
      LIMIT 100
    `);
    res.status(200).json({ success: true, logs: rows });
  } catch (err) {
    console.error("Error fetching logs:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
}

module.exports = { getLoginLogs };
