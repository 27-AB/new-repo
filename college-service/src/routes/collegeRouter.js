const router = require("express").Router();
const c = require("../controllers/collegeController");
const { protect, requireRole } = require("../middleware/auth");

// --- 1. SEED ROUTE (MUST BE AT THE TOP & GET METHOD) ---
router.get("/seed", c.seed); 

// --- 2. GENERAL ROUTES ---
router.get("/", protect, c.getAll);
router.get("/researchers", protect, c.getResearchers);

// --- 3. SPECIFIC ID ROUTES ---
router.get("/:id", protect, c.getOne);

// --- 4. ADMIN ACTIONS ---
router.post("/", protect, requireRole("admin"), c.create);
router.put("/:id", protect, requireRole("admin"), c.update);
router.delete("/:id", protect, requireRole("admin"), c.remove);

module.exports = router;
