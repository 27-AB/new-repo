require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
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

mongoose.connect(process.env.MONGO_URI, {
 family: 4
})
  .then(() => console.log("Auth-service connected to MongoDB"))
  .catch(err => console.error("MongoDB error:", err.message));

app.use((req, _res, next) => { console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`); next(); });
app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth-service" }));
app.use("/auth", require("./routes/authRouter"));
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found." }));

module.exports = app;
