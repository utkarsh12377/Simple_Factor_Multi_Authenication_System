// src/server/utils/auditService.js
const crypto = require("crypto");
const db = require("../db");

const HMAC_KEY = process.env.AUDIT_HMAC_KEY || "fallback_dev_key";

/** Format Date to MySQL DATETIME: "YYYY-MM-DD HH:MM:SS" */
function formatForMySQL(date) {
  if (!date) return new Date().toISOString().slice(0, 19).replace("T", " ");
  if (typeof date === "string") {
    // if a string (already), normalize trimming possible 'Z'
    return date.slice(0, 19).replace("T", " ").replace("Z", "");
  }
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/** Normalize JSON to compact canonical form (no spaces, stable order) */
function normalizeJSON(obj) {
  try {
    if (!obj) return "{}";
    // If obj is string, parse it
    const parsed = typeof obj === "string" ? JSON.parse(obj) : obj;
    // Stable stringify: default JSON.stringify is fine for our simple event objects.
    return JSON.stringify(parsed);
  } catch {
    return "{}";
  }
}

/** Build HMAC-SHA256 over the chain inputs */
function generateHash(previousHash, eventDataCompactString, createdAt) {
  const data = `${previousHash}|${eventDataCompactString}|${createdAt}`;
  return crypto.createHmac("sha256", HMAC_KEY).update(data).digest("hex");
}

/** Append a new audit log entry (compact JSON stored) */
async function appendAudit(userId, eventType, eventData) {
  try {
    // get last entry hash
    const [rows] = await db.query(
      "SELECT entry_hash FROM audit_logs ORDER BY audit_id DESC LIMIT 1"
    );
    const previousHash = rows[0]?.entry_hash || "";

    const createdAt = formatForMySQL(new Date().toLocaleString("sv-SE"));

    const normalizedData = normalizeJSON(eventData); // compact JSON string
    const entryHash = generateHash(previousHash, normalizedData, createdAt);

    await db.query(
      `INSERT INTO audit_logs 
       (user_id, event_type, event_data, created_at, entry_hash, previous_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, eventType, normalizedData, createdAt, entryHash, previousHash]
    );

    console.log("✅ Audit log added:", eventType);
  } catch (err) {
    console.error("❌ Error appending audit log:", err);
  }
}

/** Verify entire audit chain (parses DB JSON and normalizes before hashing) */
async function verifyAuditChain() {
  try {
    const [rows] = await db.query("SELECT * FROM audit_logs ORDER BY audit_id ASC");
    if (!rows.length) return { valid: true, message: "No audit logs yet" };

    let previousHash = "";
    for (const log of rows) {
      // Parse whatever MySQL returned and normalize to compact string
      let eventObj;
      try {
        eventObj = typeof log.event_data === "string" ? JSON.parse(log.event_data) : log.event_data;
      } catch {
        eventObj = {};
      }
      const normalizedData = JSON.stringify(eventObj);
      const createdAt = formatForMySQL(new Date(log.created_at).toLocaleString("sv-SE"));


      const expectedHash = generateHash(previousHash, normalizedData, createdAt);
      if (log.entry_hash !== expectedHash) {
        console.error("❌ Tampering detected at audit_id:", log.audit_id);
        return { valid: false, failedAt: log.audit_id };
      }

      previousHash = log.entry_hash;
    }

    console.log("✅ Audit chain verified successfully.");
    return { valid: true };
  } catch (err) {
    console.error("🔴 verifyAuditChain error:", err);
    return { valid: false, message: "Verification failed", error: err.message };
  }
}

module.exports = { appendAudit, verifyAuditChain };
