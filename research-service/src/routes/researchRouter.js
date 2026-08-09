// research-service/src/routes/researchRouter.js
const router = require("express").Router();
const c = require("../controllers/researchController");
const { protect, requireRole } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const commentCtrl = require("../controllers/commentController");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type. Only images, PDFs, and documents are allowed."));
  }
});

// --- UPDATED ROUTES WITH RBAC ---

// 1. ALL ROLES: Can view projects (Controller will handle filtering what they see)
router.get("/",        protect, c.getAll);
router.get("/:id",     protect, c.getOne);

// 2. PI & ADMIN ONLY: Can create and edit projects
router.post("/",       protect, requireRole("admin", "pi"), upload.array("attachments", 5), c.create);
router.put("/:id",     protect, requireRole("admin", "pi"), upload.array("attachments", 5), c.update);

// 3. ADMIN ONLY: Full system access for deletion
router.delete("/:id",  protect, requireRole("admin"), c.remove);

// 4. PI & ADMIN ONLY: Request extensions
router.post('/:id/extension', protect, requireRole('admin', 'pi'), async (req, res) => {
  const ExtensionRequest = require('../models/ExtensionRequest');
  try {
    const request = await ExtensionRequest.create({
      projectId: req.params.id,
      ...req.body,
      requestedBy: req.user.id
    });
    res.json({ success: true, request });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// 5. PI & ADMIN ONLY: Manage Collaborators (Co-researchers)
router.post("/:id/collaborators",       protect, requireRole("admin", "pi"), c.addCollaborator);
router.put("/:id/collaborators",        protect, requireRole("admin", "pi"), c.updateCollaborator);
router.delete("/:id/collaborators",     protect, requireRole("admin", "pi"), c.removeCollaborator);

// 6. CONTRIBUTIONS: PI, Co-researcher, Reviewer, and Admin can comment
// Funder is EXCLUDED here (view-only)
router.post("/:id/comments", protect, requireRole("admin", "pi", "co_researcher", "reviewer"), commentCtrl.addComment);
router.get("/:id/comments",  protect, commentCtrl.getComments);

// 7. REVIEWER & ADMIN ONLY: Approval Workflow (inline handler to avoid undefined controller)
router.post("/:id/approve", protect, requireRole("admin", "reviewer"), async (req, res) => {
  try {
    const Research = require("../models/Research");
    const project = await Research.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    // Set status to 'active' to indicate approval (adjust if you prefer another status)
    project.status = "active";
    project.lastModifiedBy = req.user.id;
    project.lastModifiedByName = req.user.name;
    await project.save();

    res.json({ success: true, message: "Project approved.", project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Seed route
router.post("/seed",   c.seed);

module.exports = router;