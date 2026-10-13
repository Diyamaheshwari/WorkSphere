const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.post('/', protect, authorize('manager', 'admin'), createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('manager', 'admin'), deleteTask);
router.post('/:id/comments', protect, addComment);

module.exports = router;
