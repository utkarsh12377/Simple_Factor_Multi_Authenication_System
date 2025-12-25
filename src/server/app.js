// src/server/app.js
/*
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running on port 5001 🚀" });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
*/


// src/server/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Import route modules
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const otpRoutes = require("./routes/otp.routes");

// Mount routes with prefixes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/otp", otpRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running on port 5001 🚀" });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
