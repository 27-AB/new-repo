require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// Replace app.use(cors()); with this:
const allowedOrigins = [
  "https://astu-analytics.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our list OR is a vercel.app link
    const isVercel = origin.endsWith(".vercel.app");
    
    if (allowedOrigins.indexOf(origin) !== -1 || isVercel) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
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
