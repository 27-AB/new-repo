const router = require("express").Router();
const c = require("../controllers/collegeController");
const { protect, requireRole } = require("../middleware/auth");

// --- 1. SEED ROUTE (MUST BE AT THE TOP & GET METHOD) ---
// This allows you to seed the database by visiting the URL in your browser.
router.get("/seed", c.seed); 

// --- 2. GENERAL ROUTES ---
// GET /colleges/ - Get all colleges
router.get("/", c.getAll);

// GET /colleges/researchers - Get all researchers
router.get("/researchers", c.getResearchers);

// --- 3. SPECIFIC ID ROUTES ---
// GET /colleges/:id - Get one college by ID
router.get("/:id", protect, c.getOne);

// --- 4. ADMIN ACTIONS (ADMIN ROLE ONLY) ---
router.post("/", protect, requireRole("admin"), c.create);
router.put("/:id", protect, requireRole("admin"), c.update);
router.delete("/:id", protect, requireRole("admin"), c.remove);
// Create researcher
router.post("/researchers", protect, requireRole("admin"), c.createResearcher);
// Read single researcher (protected)
router.get("/researchers/:id", protect, c.getResearcher);
// Update researcher
router.put("/researchers/:id", protect, requireRole("admin"), c.updateResearcher);
// Delete researcher
router.delete("/researchers/:id", protect, requireRole("admin"), c.removeResearcherById);

module.exports = router;
