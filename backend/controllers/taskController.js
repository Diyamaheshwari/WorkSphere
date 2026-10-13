const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Get tasks with filtering & search
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, health, category, assignedTo, project, managerId, search, myTasks } = req.query;

    const query = {};

    // Filter by assignee
    if (myTasks === 'true' || (req.user.role === 'user' && !assignedTo)) {
      query.assignedTo = req.user._id;
    } else if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo;
    }

    // Filter by manager (Manager view default)
    if (managerId) {
      query.manager = managerId;
    } else if (req.user.role === 'manager' && !assignedTo && myTasks !== 'true') {
      // By default, manager can see all tasks under their supervision
      query.$or = [{ manager: req.user._id }, { createdBy: req.user._id }];
    }

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (health && health !== 'all') query.health = health;
    if (category && category !== 'all') query.category = category;
    if (project && project !== 'all') query.project = project;

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role department title avatar')
      .populate('createdBy', 'name email role')
      .populate('manager', 'name email')
      .populate('project', 'title status department deadline')
      .populate('comments.user', 'name email role title avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving tasks',
    });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Manager, Admin, User)
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      health,
      progress,
      category,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a task title',
      });
    }

    let managerId = null;
    if (req.user.role === 'manager') {
      managerId = req.user._id;
    } else if (project) {
      const projDoc = await Project.findById(project);
      if (projDoc && projDoc.manager) managerId = projDoc.manager;
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: project || null,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      manager: managerId,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      health: health || 'on_track',
      progress: progress || 0,
      category: category || 'Development',
      status: 'todo',
    });

    await task.populate('assignedTo', 'name email role department title avatar');
    await task.populate('createdBy', 'name email role');
    await task.populate('project', 'title status department');

    const assigneeName = task.assignedTo ? task.assignedTo.name : 'Unassigned';
    await Activity.create({
      user: req.user._id,
      action: 'TASK_CREATED',
      details: `${req.user.name} created task "${task.title}" and assigned to ${assigneeName}`,
      task: task._id,
      project: task.project?._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating task',
    });
  }
};

// @desc    Update task (status, progress, health, priority, details)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const isOwner =
      (task.assignedTo && task.assignedTo.toString() === req.user._id.toString()) ||
      task.createdBy.toString() === req.user._id.toString();

    const isElevated =
      req.user.role === 'manager' ||
      req.user.role === 'admin' ||
      (task.manager && task.manager.toString() === req.user._id.toString());

    if (!isOwner && !isElevated) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this task',
      });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project,
      health,
      progress,
      category,
    } = req.body;

    const oldStatus = task.status;

    if (title !== undefined && isElevated) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (health !== undefined) task.health = health;
    if (category !== undefined) task.category = category;
    if (assignedTo !== undefined && isElevated) task.assignedTo = assignedTo || null;
    if (project !== undefined && isElevated) task.project = project || null;

    if (progress !== undefined) {
      task.progress = Number(progress);
      if (task.progress >= 100) {
        task.status = 'completed';
        task.completedAt = new Date();
      }
    }

    let statusChanged = false;
    if (status !== undefined && status !== oldStatus) {
      task.status = status;
      statusChanged = true;
      if (status === 'completed') {
        task.progress = 100;
        task.completedAt = new Date();
      }
    }

    await task.save();

    await task.populate('assignedTo', 'name email role department title avatar');
    await task.populate('createdBy', 'name email role');
    await task.populate('project', 'title status department');
    await task.populate('comments.user', 'name email role title avatar');

    const formatStatus = (s) =>
      s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : s === 'review' ? 'Review' : 'Completed';

    if (statusChanged) {
      await Activity.create({
        user: req.user._id,
        action: 'TASK_STATUS_UPDATED',
        details: `${req.user.name} moved task "${task.title}" to ${formatStatus(task.status)}`,
        task: task._id,
        project: task.project?._id,
      });
    } else {
      await Activity.create({
        user: req.user._id,
        action: 'TASK_UPDATED',
        details: `${req.user.name} updated details for task "${task.title}"`,
        task: task._id,
        project: task.project?._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task',
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Manager, Admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const title = task.title;
    await task.deleteOne();

    await Activity.create({
      user: req.user._id,
      action: 'TASK_DELETED',
      details: `${req.user.name} deleted task "${title}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    });

    await task.save();
    await task.populate('comments.user', 'name email role title avatar');

    await Activity.create({
      user: req.user._id,
      action: 'COMMENT_ADDED',
      details: `${req.user.name} commented on "${task.title}": "${text.slice(0, 35)}..."`,
      task: task._id,
    });

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comments: task.comments,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Server error adding comment' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment,
};
