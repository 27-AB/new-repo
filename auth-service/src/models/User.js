// auth-service/src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const VALID_ROLES = ["admin", "pi", "co_researcher", "reviewer", "funder", "researcher", "viewer"];

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  notificationEmail: { type: String, default: "", lowercase: true, trim: true },
  emailVerified: { type: Boolean, default: false },
  password:  { type: String, required: true, minlength: 6 },
  // Expanded role enum to include the new roles. Keep 'researcher' and 'viewer' for backward compatibility.
  // Replace the role section in User.js
role: {
    type: String,
    enum: ['admin', 'pi', 'co_researcher', 'reviewer', 'funder'],
    default: 'pi'
},
  college:   { type: String, default: "" },
  avatar:    { type: String, default: "" },
  isActive:  { type: Boolean, default: true },
  receiveNotifications: { type: Boolean, default: true },
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

// Convenience role checks
userSchema.methods.isAdmin = function () { return this.role === "admin"; };
userSchema.methods.isPI = function () { return this.role === "pi"; };
userSchema.methods.isCoResearcher = function () { return this.role === "co_researcher"; };
userSchema.methods.isReviewer = function () { return this.role === "reviewer"; };
userSchema.methods.isFunder = function () { return this.role === "funder"; };

userSchema.statics.VALID_ROLES = VALID_ROLES;

module.exports = mongoose.model("User", userSchema);