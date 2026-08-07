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

router.get("/",        protect, c.getAll);
router.get("/:id",     protect, c.getOne);
router.post("/",       protect, requireRole("admin", "researcher"), upload.array("attachments", 5), c.create);
router.put("/:id",     protect, requireRole("admin", "researcher"), upload.array("attachments", 5), c.update);
router.delete("/:id",  protect, requireRole("admin"), c.remove);

// Add this near your other routes
router.post('/:id/extension', protect, requireRole('admin', 'researcher'), async (req, res) => {
  // Simple logic to create the request
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
// Collaborator management routes
router.post("/:id/collaborators",       protect, requireRole("admin", "researcher"), c.addCollaborator);
router.put("/:id/collaborators",        protect, requireRole("admin", "researcher"), c.updateCollaborator);
router.delete("/:id/collaborators",     protect, requireRole("admin", "researcher"), c.removeCollaborator);
router.post("/:id/comments", protect, commentCtrl.addComment);
router.get("/:id/comments", protect, commentCtrl.getComments);

router.post("/seed",   c.seed);

module.exports = router;
