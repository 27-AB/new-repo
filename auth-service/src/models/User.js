const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  notificationEmail: { type: String, default: "", lowercase: true, trim: true }, // User must set this for notifications
  emailVerified: { type: Boolean, default: false }, // Track if email is verified
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ["admin", "researcher", "viewer"], default: "viewer" },
  college:   { type: String, default: "" },
  avatar:    { type: String, default: "" },
  isActive:  { type: Boolean, default: true },
  receiveNotifications: { type: Boolean, default: true }, // User preference for notifications
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
