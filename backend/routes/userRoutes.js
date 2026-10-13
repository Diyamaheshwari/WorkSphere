const express = require('express');
const router = express.Router();
const {
  getUsers,
  getManagers,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserRole,
  toggleUserStatus,
  createUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to list managers for registration dropdown
router.get('/managers', getManagers);

// Protected routes
router.get('/', protect, getUsers);
router.get('/pending', protect, authorize('manager', 'admin'), getPendingUsers);
router.put('/:id/approve', protect, authorize('manager', 'admin'), approveUser);
router.put('/:id/reject', protect, authorize('manager', 'admin'), rejectUser);

// Create user (Admin can create any role; Manager can create team members)
router.post('/', protect, authorize('manager', 'admin'), createUser);

// Admin-only role and status modifications
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
