// src/server/utils/passwordValidator.js
const DEFAULTS = {
  minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "10", 10),
  requireLower: true,
  requireUpper: true,
  requireDigit: true,
  requireSpecial: true,
  forbiddenPasswords: [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "letmein",
    "admin",
    "welcome",
    "iloveyou",
    "test123",
  ],
};

function hasLower(s) {
  return /[a-z]/.test(s);
}
function hasUpper(s) {
  return /[A-Z]/.test(s);
}
function hasDigit(s) {
  return /[0-9]/.test(s);
}
function hasSpecial(s) {
  return /[!@#$%^&*(),.?":{}|<>_\-\[\]\/~`+=;']/ .test(s);
}

function validatePassword(password, options = {}) {
  const cfg = { ...DEFAULTS, ...options };
  const errors = [];

  if (typeof password !== "string") {
    return { valid: false, errors: ["Password must be a string"] };
  }

  if (password.length < cfg.minLength) {
    errors.push(`Password must be at least ${cfg.minLength} characters long.`);
  }
  if (cfg.requireLower && !hasLower(password)) {
    errors.push("Password must include at least one lowercase letter.");
  }
  if (cfg.requireUpper && !hasUpper(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }
  if (cfg.requireDigit && !hasDigit(password)) {
    errors.push("Password must include at least one digit.");
  }
  if (cfg.requireSpecial && !hasSpecial(password)) {
    errors.push("Password must include at least one special character (e.g. !@#$%).");
  }

  // Only reject exact matches of a very common password or very short modifications.
  // Do NOT reject just because the password contains the word "password" within a longer, strong string.
  const pwLower = password.toLowerCase().trim();
  for (const banned of cfg.forbiddenPasswords) {
    if (pwLower === banned) {
      errors.push("Password is too common or predictable.");
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePassword };
