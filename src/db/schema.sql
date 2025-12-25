-- ========================================================================
-- RECREATE DATABASE
-- ========================================================================
DROP DATABASE IF EXISTS smfa;
CREATE DATABASE smfa;
USE smfa;

-- ========================================================================
-- USERS TABLE (core table)
-- ========================================================================
CREATE TABLE users (
  user_id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_status TINYINT(1) NOT NULL DEFAULT 0,
  otp VARCHAR(6) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY (email)
);

-- ========================================================================
-- OTP TABLE (used by your current OTP backend)
-- ========================================================================
CREATE TABLE otp_table (
  otp_id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  otp VARCHAR(10) DEFAULT NULL,
  expiry_timestamp DATETIME DEFAULT NULL,
  is_used TINYINT(1) DEFAULT 0,
  PRIMARY KEY (otp_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ========================================================================
-- LOGIN LOGS (exact schema matched to authController.js)
-- ========================================================================
CREATE TABLE login_logs (
  log_id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  status ENUM('SUCCESS','FAIL','LOCKED') NOT NULL,
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ========================================================================
-- AUDIT LOGS (PERFECT MATCH FOR auditService.js)
-- ========================================================================
-- Your backend inserts:
-- INSERT INTO audit_logs (user_id, event_type, event_data, created_at, entry_hash, previous_hash)
-- → so your schema MUST follow exactly this structure.

CREATE TABLE audit_logs (
  audit_id INT NOT NULL AUTO_INCREMENT,

  user_id INT DEFAULT NULL,

  -- Event name (e.g., login_success, login_failed)
  event_type VARCHAR(255) NOT NULL,

  -- JSON metadata (email, IP, error)
  event_data JSON DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Hash chain fields
  entry_hash VARCHAR(255) NOT NULL,
  previous_hash VARCHAR(255) DEFAULT '',

  PRIMARY KEY (audit_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ========================================================================
-- CLEANUP — Remove obsolete/duplicate OTP table from old version
-- ========================================================================
DROP TABLE IF EXISTS otps;
