const express = require('express');
const router = express.Router();
const {
  getUserDashboard,
  getManagerDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User Dashboard: Accessible by user, manager, and admin
router.get('/user', protect, authorize('user', 'manager', 'admin'), getUserDashboard);

// Manager Dashboard: Accessible by manager and admin
router.get('/manager', protect, authorize('manager', 'admin'), getManagerDashboard);

// Admin Dashboard: Accessible only by admin
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
