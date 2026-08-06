const express = require('express');
const router = express.Router();
const {
  updateEthicsInfo,
  getEthicsStatus,
  checkAllProjectsEthicsExpiry,
  getExpiringEthicsApprovals,
  getExpiredEthicsApprovals,
  toggleFinancialLock
} = require('../controllers/ethicsController');

// NOTE: Authentication temporarily disabled for debugging
// TODO: Re-enable authentication before production

// PUT /ethics/project/:projectId - Update ethics information
router.put('/project/:projectId', updateEthicsInfo);

// GET /ethics/project/:projectId - Get ethics status for a project
router.get('/project/:projectId', getEthicsStatus);

// POST /ethics/check-all - Check all projects for expired ethics
router.post('/check-all', checkAllProjectsEthicsExpiry);

// GET /ethics/expiring - Get projects with expiring ethics (within 30 days)
router.get('/expiring', getExpiringEthicsApprovals);

// GET /ethics/expired - Get projects with expired ethics
router.get('/expired', getExpiredEthicsApprovals);

// POST /ethics/project/:projectId/toggle-lock - Manually lock/unlock a project
router.post('/project/:projectId/toggle-lock', toggleFinancialLock);

module.exports = router;
