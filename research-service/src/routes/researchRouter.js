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

// --- 1. SEED ROUTE (MUST BE AT THE TOP & GET METHOD) ---
// This allows you to visit /projects/seed in your browser to setup the DB
router.get("/seed", c.seed);

// --- 2. GENERAL VIEWING ROUTES ---
router.get("/",        protect, c.getAll);

// --- 3. PROJECT CREATION & EDITING (PI & ADMIN ONLY) ---
router.post("/",       protect, requireRole("admin", "pi"), upload.array("attachments", 5), c.create);

// --- 4. SPECIFIC ID ROUTES (MUST BE BELOW /seed) ---
router.get("/:id",     protect, c.getOne);
router.put("/:id",     protect, requireRole("admin", "pi"), upload.array("attachments", 5), c.update);
router.delete("/:id",  protect, requireRole("admin"), c.remove);

// --- 5. EXTENSION REQUESTS (PI & ADMIN ONLY) ---
router.post('/:id/extension', protect, requireRole('admin', 'pi'), async (req, res) => {
  try {
    const ExtensionRequest = require('../models/ExtensionRequest');
    const request = await ExtensionRequest.create({
      projectId: req.params.id,
      ...req.body,
      requestedBy: req.user.id
    });
    res.json({ success: true, request });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
});

// --- 6. COLLABORATOR MANAGEMENT ---
router.post("/:id/collaborators",   protect, requireRole("admin", "pi"), c.addCollaborator);
router.put("/:id/collaborators",    protect, requireRole("admin", "pi"), c.updateCollaborator);
router.delete("/:id/collaborators", protect, requireRole("admin", "pi"), c.removeCollaborator);

// --- 7. COMMENTS (EXCLUDES FUNDER) ---
router.post("/:id/comments", protect, requireRole("admin", "pi", "co_researcher", "reviewer"), commentCtrl.addComment);
router.get("/:id/comments",  protect, commentCtrl.getComments);

// --- 8. APPROVAL WORKFLOW (REVIEWER & ADMIN ONLY) ---
router.post("/:id/approve", protect, requireRole("admin", "reviewer"), async (req, res) => {
  try {
    const Research = require("../models/Research");
    const project = await Research.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    project.status = "active";
    project.lastModifiedBy = req.user.id;
    project.lastModifiedByName = req.user.name;
    await project.save();

    res.json({ success: true, message: "Project approved.", project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
