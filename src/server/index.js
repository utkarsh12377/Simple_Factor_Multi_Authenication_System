const express = require('express');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static public/ (so /otp.html works)
app.use(express.static('public'));

// Simple session middleware (dev). In production use a proper store.
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-please-change',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, maxAge: 1000 * 60 * 60 } // secure: true for HTTPS
}));

// Rate limiter for OTP requests to prevent abuse
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many OTP requests, please try later' }
});

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// OTP routes
const otpRoutes = require('./routes/otp.routes');
// apply rate limiter to OTP request endpoint (path must match mounted route)
app.use('/api/otp/request-otp', otpLimiter);
app.use('/auth/request-otp', otpLimiter);
app.use('/api/otp', otpRoutes);
// also mount under /auth for compatibility with some examples/static page
app.use('/auth', otpRoutes);

// Health check endpoint (for debugging)
app.get('/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;

// Load SSL certificates
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert'))
};

https.createServer(sslOptions, app).listen(PORT, async () => {
  console.log(`Secure Server listening on ${PORT}`);

  // Test MySQL connection using exported pool
  try {
    await db.query('SELECT 1'); // simple ping query
    console.log('✅ Connected to MySQL successfully!');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
});
