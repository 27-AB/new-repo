const express = require("express");
const router = express.Router();

const Milestone = require("../models/Milestone");

// GET /calendar/feed/:projectId.ics
router.get("/feed/:projectId.ics", async (req, res) => {
  try {
    const milestones = await Milestone.find({
      projectId: req.params.projectId
    });

    let ical = "BEGIN:VCALENDAR\r\n";
    ical += "VERSION:2.0\r\n";
    ical += "PRODID:-//ASTU Analytics//Research Calendar//EN\r\n";

    milestones.forEach((milestone) => {
      const startDate = new Date(milestone.dueDate);

      if (isNaN(startDate.getTime())) return;

      const dateString = startDate
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");

      ical += "BEGIN:VEVENT\r\n";
      ical += `UID:${milestone._id}@astu-analytics\r\n`;
      ical += `DTSTART:${dateString}\r\n`;
      ical += `DTEND:${dateString}\r\n`;
      ical += `SUMMARY:${milestone.title || "Research Milestone"}\r\n`;
      ical += `DESCRIPTION:${milestone.description || ""}\r\n`;
      ical += "END:VEVENT\r\n";
    });

    ical += "END:VCALENDAR\r\n";

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="research-calendar.ics"`
    );

    res.send(ical);
  } catch (error) {
    console.error("Calendar feed error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate calendar feed",
      error: error.message
    });
  }
});

module.exports = router;