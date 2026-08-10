const router = require("express").Router();
const { register, login, getMe, getUsers, updateRole, seed, getResearchers, createUser, updateProfile, updateUserProfile } = require("../controllers/authController");
const { seedUserEmails, updateUserEmail, getAllUsersWithEmails } = require("../controllers/seedEmails");
const { updateNotificationEmail, getNotificationSettings, sendVerificationEmail } = require("../controllers/profileController");
const { protect, requireRole } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);

// Notification settings
router.get("/notification-settings", protect, getNotificationSettings);
router.put("/notification-email", protect, updateNotificationEmail);
router.post("/verify-notification-email", protect, sendVerificationEmail);

router.get("/users", protect, requireRole("admin"), getUsers);
router.get("/users-with-emails", protect, requireRole("admin"), getAllUsersWithEmails);
router.post("/users", protect, requireRole("admin"), createUser);
router.put("/users/:id", protect, requireRole("admin"), updateUserProfile);
router.put("/users/:userId/email", protect, requireRole("admin"), updateUserEmail);
router.put("/users/:id/role", protect, requireRole("admin"), updateRole);
router.get("/researchers", protect, getResearchers);
router.post("/seed", seed);
router.post("/seed-emails", seedUserEmails);

module.exports = router;
