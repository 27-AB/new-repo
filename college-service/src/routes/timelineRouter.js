const router = require("express").Router();
const c = require("../controllers/timelineController");
const { protect, requireRole } = require("../middleware/auth");

// Special routes first (before parameterized ones)
router.get("/all", protect, c.getAllTimelines);
router.get("/stats", protect, c.getTimelineStats);

// User timeline routes
router.get("/user/timeline", protect, c.getUserTimeline);

// Timeline routes for any entity
router.get("/:entityType/:entityId/timeline", protect, c.getEntityTimeline);
router.get("/:entityType/:entityId/timeline/analytics", protect, c.getEntityTimelineAnalytics);
router.post("/:entityType/:entityId/timeline", protect, requireRole("admin", "researcher"), c.createTimelineItem);
router.put("/timeline/:id", protect, requireRole("admin", "researcher"), c.updateTimelineItem);
router.delete("/timeline/:id", protect, requireRole("admin", "researcher"), c.deleteTimelineItem);
router.put("/timeline/order", protect, requireRole("admin", "researcher"), c.updateTimelineOrder);

module.exports = router;