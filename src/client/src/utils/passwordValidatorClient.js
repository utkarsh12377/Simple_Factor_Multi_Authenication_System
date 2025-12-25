// src/client/src/utils/passwordValidatorClient.js
export const DEFAULT_POLICY = {
  minLength: 12,
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
    "test123"
  ],
};

function hasLower(s) { return /[a-z]/.test(s); }
function hasUpper(s) { return /[A-Z]/.test(s); }
function hasDigit(s)  { return /[0-9]/.test(s); }
function hasSpecial(s){ return /[!@#$%^&*(),.?":{}|<>_\-\[\]\\/`~+=;';]/.test(s); }

export function validatePasswordClient(password, policy = DEFAULT_POLICY) {
  const errors = [];

  if (typeof password !== "string") {
    errors.push("Password must be a string.");
    return { valid: false, errors };
  }

  if (password.length < policy.minLength)
    errors.push(`Password must be at least ${policy.minLength} characters long.`);
  if (policy.requireLower && !hasLower(password))
    errors.push("Password must include at least one lowercase letter.");
  if (policy.requireUpper && !hasUpper(password))
    errors.push("Password must include at least one uppercase letter.");
  if (policy.requireDigit && !hasDigit(password))
    errors.push("Password must include at least one digit.");
  if (policy.requireSpecial && !hasSpecial(password))
    errors.push("Password must include at least one special character (e.g. !@#$%).");

  const normalized = password.toLowerCase().trim();
  for (const bad of policy.forbiddenPasswords) {
    if (normalized === bad) {
      errors.push("Password is too common or predictable.");
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}
