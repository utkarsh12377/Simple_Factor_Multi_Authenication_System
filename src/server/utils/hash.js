// src/server/utils/hash.js
const bcrypt = require('bcryptjs');

// Function to hash a password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Function to verify a password
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = { hashPassword, verifyPassword };
