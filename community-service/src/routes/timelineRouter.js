const router = require("express").Router();
const c = require("../controllers/timelineController");
// Authentication temporarily disabled for debugging
// const { protect, requireRole } = require("../middleware/auth");

// Special routes first (before parameterized ones)
router.get("/all", c.getAllTimelines);
router.get("/stats", c.getTimelineStats);

// User timeline routes
router.get("/user/timeline", c.getUserTimeline);

// Timeline routes for any entity
router.get("/:entityType/:entityId/timeline", c.getEntityTimeline);
router.get("/:entityType/:entityId/timeline/analytics", c.getEntityTimelineAnalytics);
router.post("/:entityType/:entityId/timeline", c.createTimelineItem);
router.put("/timeline/:id", c.updateTimelineItem);
router.delete("/timeline/:id", c.deleteTimelineItem);
router.put("/timeline/order", c.updateTimelineOrder);

module.exports = router;