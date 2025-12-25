// src/server/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
   password: process.env.DB_PASSWORD || process.env.DB_PASS || "",
  database: process.env.DB_NAME || "smfa",
   waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Only run the startup connection test if NOT running under test environment.
// Jest sets NODE_ENV to "test" by default.
if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      const conn = await pool.getConnection();
      console.log("✅ Connected to MySQL successfully");
      conn.release();
    } catch (err) {
      console.error("❌ MySQL connection error:", err.message);
    }
  })();
}

module.exports = pool;
