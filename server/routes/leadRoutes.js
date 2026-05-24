const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// Standard Lead CRUD and Stats Routing
// IMPORTANT: /stats must be listed BEFORE /:id so it doesn't get matched as an ID cast
router.get('/stats', protect, getLeadStats);

router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

module.exports = router;
