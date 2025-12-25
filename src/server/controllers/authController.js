// src/server/controllers/authController.js

const db = require("../db");
const bcrypt = require("bcryptjs");
const { appendAudit } = require("../utils/auditService");
const { validatePassword } = require("../utils/passwordValidator");

// Log every login attempt
async function logEvent(user_id, email, status, ip) {
  try {
    await db.execute(
      "INSERT INTO login_logs (user_id, email, status, ip_address) VALUES (?, ?, ?, ?)",
      [user_id, email, status, ip]
    );
  } catch (err) {
    // Log locally but don't fail the request because of logging problems
    console.error("Log event error:", err && err.message ? err.message : err);
  }
}

// ================================
// CREATE USER
// ================================
async function createUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  // Validate password strength
  const { valid, errors } = validatePassword(password);
  if (!valid) {
    return res.status(400).json({
      error: "Password does not meet the required strength",
      details: errors, // helpful for dev/testing; remove details in high-security prod if desired
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const [result] = await db.execute(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, hashed]
    );

    await appendAudit(result.insertId, "user_created", { email });

    return res.status(201).json({ user_id: result.insertId, email });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Email already exists" });

    console.error("Create user error:", err);
    await appendAudit(null, "user_create_error", { email, error: err.message });
    return res.status(500).json({ error: "Server error" });
  }
}

// ================================
// LOGIN USER  (WITH ACCOUNT LOCK)
// ================================
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const ip = req.ip;

  try {
    const [rows] = await db.execute(
      "SELECT user_id, password_hash, locked_status, failed_attempts FROM users WHERE email=?",
      [email]
    );

    const user = rows[0];

    // Case: user not found
    if (!user) {
      await logEvent(null, email, "FAIL", ip);
      try { await appendAudit(null, "login_failed", { email, ip }); } catch(_) {}
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Case: account locked
    if (user.locked_status) {
      await logEvent(user.user_id, email, "LOCKED", ip);
      await appendAudit(user.user_id, "login_locked", { email, ip });
      return res.status(403).json({ error: "Account locked. Contact admin." });
    }

    // Case 3: wrong password — increase failed attempts
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      await db.execute(
        "UPDATE users SET failed_attempts = failed_attempts + 1 WHERE user_id = ?",
        [user.user_id]
      );

      if (user.failed_attempts + 1 >= 3) {
        await db.execute(
          "UPDATE users SET locked_status = 1 WHERE user_id = ?",
          [user.user_id]
        );

        await logEvent(user.user_id, email, "LOCKED", ip);
        await appendAudit(user.user_id, "account_locked", { email, ip });

        return res
          .status(403)
          .json({ error: "Account locked after 3 failed login attempts" });
      }

      await logEvent(user.user_id, email, "FAIL", ip);
      try { await appendAudit(user.user_id, "login_failed", { email, ip }); } catch(_) {}
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Case 4: SUCCESS — reset failed attempts
    await db.execute(
      "UPDATE users SET failed_attempts = 0 WHERE user_id = ?",
      [user.user_id]
    );

    await logEvent(user.user_id, email, "SUCCESS", ip);
    try { await appendAudit(user.user_id, "login_success", { email, ip }); } catch(_) {}

    // At this point we require OTP as your flow defines. Return needOtp flag.
    return res.status(200).json({ needOtp: true, user_id: user.user_id });
  } catch (err) {
    console.error("Login error:", err && err.message ? err.message : err);
    try { await appendAudit(null, "login_error", { email, ip, error: err?.message || String(err) }); } catch(_) {}
    return res.status(500).json({ error: "Server error" });
  }
}

// Export functions
module.exports = { createUser, login };
