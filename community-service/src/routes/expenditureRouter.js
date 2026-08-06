const express = require('express');
const router = express.Router();
const {
  createExpenditure,
  getProjectExpenditures,
  getExpenditureSummary,
  updateExpenditure,
  deleteExpenditure,
  approveExpenditure,
  rejectExpenditure,
  getExpendituresByCategory
} = require('../controllers/expenditureController');

// NOTE: Authentication temporarily disabled for debugging
// TODO: Re-enable authentication before production

// POST /expenditures - Create a new expenditure
router.post('/', createExpenditure);

// GET /expenditures/project/:projectId - Get all expenditures for a project
router.get('/project/:projectId', getProjectExpenditures);

// GET /expenditures/project/:projectId/summary - Get expenditure summary
router.get('/project/:projectId/summary', getExpenditureSummary);

// GET /expenditures/project/:projectId/by-category - Get category breakdown
router.get('/project/:projectId/by-category', getExpendituresByCategory);

// PUT /expenditures/:id - Update an expenditure
router.put('/:id', updateExpenditure);

// DELETE /expenditures/:id - Delete an expenditure
router.delete('/:id', deleteExpenditure);

// POST /expenditures/:id/approve - Approve an expenditure (admin only)
router.post('/:id/approve', approveExpenditure);

// POST /expenditures/:id/reject - Reject an expenditure (admin only)
router.post('/:id/reject', rejectExpenditure);

module.exports = router;
