const express = require('express');
const router = express.Router();
const {
  createMilestone,
  getProjectMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone,
  getAllMilestones,
  getOverdueMilestones,
  getUpcomingMilestones,
  getMilestonesByStatus,
  completeMilestone,
  getMilestoneStats,
  seedMilestones,
  submitMilestoneReport,
  requestRevision
} = require('../controllers/milestoneController');

// POST /milestones - Create a new milestone
router.post('/', createMilestone);

router.post('/:id/submit', submitMilestoneReport);

router.post('/:id/request-revision', requestRevision);
// GET /milestones - Get all milestones across all projects
router.get('/all', getAllMilestones);

// GET /milestones/overdue - Get overdue milestones
router.get('/overdue', getOverdueMilestones);

// GET /milestones/upcoming - Get upcoming milestones (next 30 days)
router.get('/upcoming', getUpcomingMilestones);

// GET /milestones/stats - Get milestone statistics
router.get('/stats', getMilestoneStats);

// POST /milestones/seed - Seed milestones for existing projects
router.post('/seed', seedMilestones);

// GET /milestones/status/:status - Get milestones by status
router.get('/status/:status', getMilestonesByStatus);

// GET /milestones/project/:projectId - Get all milestones for a project
router.get('/project/:projectId', getProjectMilestones);

// GET /milestones/:id - Get a single milestone
router.get('/:id', getMilestone);

// PUT /milestones/:id - Update a milestone
router.put('/:id', updateMilestone);

// POST /milestones/:id/complete - Complete a milestone
router.post('/:id/complete', completeMilestone);

// DELETE /milestones/:id - Delete a milestone
router.delete('/:id', deleteMilestone);

module.exports = router;