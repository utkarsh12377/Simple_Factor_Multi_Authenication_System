// src/server/controllers/otp.controller.js
const db = require("../db");        // <-- use pool directly
const { sendOtpEmail } = require("../utils/mailer");

async function requestOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const [userRows] = await db.execute(
      "SELECT user_id FROM users WHERE email = ?", 
      [email]
    );
    if (userRows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user_id = userRows[0].user_id;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await db.execute("DELETE FROM otp_table WHERE user_id = ?", [user_id]);

    await db.execute(
      `INSERT INTO otp_table (user_id, otp, expiry_timestamp, is_used)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)`,
      [user_id, otp]
    );

    await sendOtpEmail(email, otp);
    console.log(`✅ OTP ${otp} sent to ${email}`);

    return res.json({ message: "OTP sent successfully to email" });
  } catch (err) {
    console.error("OTP request error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP required" });

  try {
    const [userRows] = await db.execute(
      "SELECT user_id FROM users WHERE email = ?", 
      [email]
    );
    if (userRows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user_id = userRows[0].user_id;

    const [rows] = await db.execute(
      `SELECT * FROM otp_table 
       WHERE user_id = ? 
         AND otp = ? 
         AND is_used = 0 
         AND expiry_timestamp > NOW()`,
      [user_id, otp]
    );

    if (rows.length === 0)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    await db.execute(
      "UPDATE otp_table SET is_used = 1 WHERE otp_id = ?",
      [rows[0].otp_id]
    );

    return res.json({ message: "OTP verified successfully", login: true });
  } catch (err) {
    console.error("OTP verify error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { requestOtp, verifyOtp };
