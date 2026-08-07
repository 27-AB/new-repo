// research-service/src/routes/calendarRouter.js
router.get("/feed/:projectId.ics", async (req, res) => {
  const milestones = await Milestone.find({ projectId: req.params.projectId });
  const ical = generateICalString(milestones); // Use a library like 'ical-generator'
  res.setHeader("Content-Type", "text/calendar");
  res.send(ical);
});
// Users can copy this link and "Subscribe" in Google/Outlook.