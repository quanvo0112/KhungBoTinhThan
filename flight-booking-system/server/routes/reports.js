const express = require('express');
const {
  generateMonthlyReport,
  generateYearlyReport,
  getReports
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Staff only routes
router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/', getReports);
router.post('/monthly', generateMonthlyReport);
router.post('/yearly', generateYearlyReport);

module.exports = router;
