require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(cors()); 
app.use(express.json());

// Enhanced Connection Logic
mongoose.connect(process.env.MONGO_URI, {
  family: 4,
  serverSelectionTimeoutMS: 5000, // Fail fast if DB is down
  autoIndex: true
})
  .then(() => console.log("✅ College-service connected to MongoDB"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    // Log this specifically for Render
  });

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "college-service" }));

// Route Mapping
const collegeRouter = require("./routes/collegeRouter");
app.use("/", collegeRouter); // This handles /colleges and /seed
app.use("/timeline", require("./routes/timelineRouter"));
app.use("/milestones", require("./routes/milestoneRouter"));

// 🎯 FIX: Force JSON errors instead of HTML errors
app.use((err, req, res, next) => {
  console.error("SERVER CRASH:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found." }));

module.exports = app;
