// src/server/routes/auth.js
const express = require("express");
const router = express.Router();

const { createUser, login } = require("../controllers/authController");

// Authentication routes
router.post("/create-user", createUser);

// Login route
router.post("/login", login);

module.exports = router;
