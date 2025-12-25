// src/server/middleware/passwordPolicy.js
// Enforce: min 8 chars, at least 1 lowercase, 1 uppercase, 1 digit, 1 special char
const passwordRules = {
  minLength: 8,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).+$/
};

function checkPasswordStrength(password) {
  if (!password || typeof password !== 'string') return { ok: false, reason: 'missing' };
  if (password.length < passwordRules.minLength) {
    return { ok: false, reason: `too_short (min ${passwordRules.minLength})` };
  }
  if (!passwordRules.regex.test(password)) {
    return { ok: false, reason: 'must_include_upper_lower_digit_special' };
  }
  return { ok: true };
}

// Express middleware: validates req.body.password (for create & change)
function requireStrongPassword(req, res, next) {
  const password = req.body && req.body.password;
  const result = checkPasswordStrength(password);
  if (!result.ok) {
    return res.status(400).json({
      error: 'weak_password',
      message:
        result.reason === 'missing'
          ? 'Password is required'
          : result.reason === 'too_short'
          ? `Password must be at least ${passwordRules.minLength} characters`
          : 'Password must include uppercase, lowercase, number and special character'
    });
  }
  next();
}

module.exports = { checkPasswordStrength, requireStrongPassword, passwordRules };
