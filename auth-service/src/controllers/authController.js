// auth-service/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, college } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "Email already registered." });
    const user = await User.create({ name, email, password, role: role || "viewer", college });
    res.status(201).json({ success: true, token: sign(user), user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      college: user.college,
      notificationEmail: user.notificationEmail || '',
      receiveNotifications: user.receiveNotifications !== undefined ? user.receiveNotifications : true
    } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated." });
    res.json({ success: true, token: sign(user), user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      college: user.college,
      notificationEmail: user.notificationEmail || '',
      receiveNotifications: user.receiveNotifications !== undefined ? user.receiveNotifications : true
    } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /auth/users  (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, total: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /auth/users/:id/role  (admin only) — change a user's role
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    // Validate against the model's VALID_ROLES
    const valid = User.VALID_ROLES || ["admin","pi","co_researcher","reviewer","funder","researcher","viewer"];
    if (!valid.includes(role))
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${valid.join(", ")}` });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, message: `Role updated to ${role}.`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /auth/researchers  — get all researchers for collaborator selection
exports.getResearchers = async (req, res) => {
  try {
    // Return users who can be collaborators: pi, co_researcher, researcher, admin
    const roleCandidates = ["pi", "co_researcher", "researcher", "admin"];
    const researchers = await User.find({ 
      role: { $in: roleCandidates },
      isActive: true 
    }).select("-password").sort({ name: 1 });
    res.json({ success: true, researchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /auth/users  (admin only) — create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, college } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "Email already registered." });
    const user = await User.create({ name, email, password, role: role || "viewer", college });
    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, college: user.college } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /auth/me  — update own profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, college, avatar, password, role } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (college) updateData.college = college;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password) {
      const bcrypt = require("bcryptjs");
      updateData.password = await bcrypt.hash(password, 10);
    }
    // Disallow role escalation via /me endpoint: only admins change roles
    if (role) {
      // ignore or reject; safer to ignore silently
      // Alternatively return 403 if role present:
      return res.status(403).json({ success: false, message: "Role change not allowed via profile. Admins only." });
    }
    
    // Check if email is being changed and if it's already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already registered." });
      }
      updateData.email = email;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /auth/users/:id  — admin only: update any user's profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, college, avatar, password, role, isActive } = req.body;
    
    // Check if user exists
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (college) updateData.college = college;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password) {
      const bcrypt = require("bcryptjs");
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role) {
      const valid = User.VALID_ROLES || ["admin","pi","co_researcher","reviewer","funder","researcher","viewer"];
      if (!valid.includes(role)) return res.status(400).json({ success: false, message: "Invalid role." });
      updateData.role = role;
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Check if email is being changed and if it's already taken by another user
    if (email && email !== targetUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already registered." });
      }
      updateData.email = email;
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select("-password");
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /auth/seed  — creates default admin + demo accounts
exports.seed = async (req, res) => {
  try {
    // Delete known seed accounts to force updates if they exist
    const seedEmails = [
      "admin@astu.edu.et", "pi@astu.edu.et", "coresearcher@astu.edu.et", "reviewer@astu.edu.et", "funder@astu.edu.et",
      "researcher@astu.edu.et", "viewer@astu.edu.et"
    ];
    await User.deleteMany({ email: { $in: seedEmails } });

    await User.create([
      // Minimal safe demo accounts (DEMO passwords)
      { name: "Demo Admin", email: "admin@astu.edu.et", password: "DEMO-AdminPass123!", role: "admin", college: "Administration" },
      { name: "Demo PI", email: "pi@astu.edu.et", password: "DEMO-PIPass123!", role: "pi", college: "College of Science" },
      { name: "Demo Co-researcher", email: "coresearcher@astu.edu.et", password: "DEMO-CoPass123!", role: "co_researcher", college: "College of Science" },
      { name: "Demo Reviewer", email: "reviewer@astu.edu.et", password: "DEMO-ReviewerPass123!", role: "reviewer", college: "Research Office" },
      { name: "Demo Funder", email: "funder@astu.edu.et", password: "DEMO-FunderPass123!", role: "funder", college: "External" },
      // Keep a generic researcher and viewer for compatibility
      { name: "Demo Researcher", email: "researcher@astu.edu.et", password: "research1234", role: "researcher", college: "College of Engineering" },
      { name: "Demo Viewer", email: "viewer@astu.edu.et", password: "viewer1234", role: "viewer", college: "Public" },
    ]);

    res.json({ success: true, message: "Demo users seeded successfully (DEMO credentials)." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};