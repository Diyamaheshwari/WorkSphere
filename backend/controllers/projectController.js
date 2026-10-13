const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { managerId } = req.query;
    const filter = {};

    if (managerId) {
      filter.manager = managerId;
    } else if (req.user.role === 'manager') {
      filter.$or = [{ manager: req.user._id }, { createdBy: req.user._id }];
    }

    const projects = await Project.find(filter)
      .populate('manager', 'name email department title')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving projects',
    });
  }
};

// @desc    Create a new project (Admin assigns to Manager; Manager creates for their team)
// @route   POST /api/projects
// @access  Private (Manager, Admin)
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, managerId, department } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a project title',
      });
    }

    let assignedManagerId = managerId || null;
    let dept = department || 'General';

    if (req.user.role === 'manager') {
      assignedManagerId = req.user._id;
      dept = req.user.department || 'General';
    } else if (assignedManagerId) {
      const mgr = await User.findById(assignedManagerId);
      if (mgr && mgr.department) {
        dept = mgr.department;
      }
    }

    const project = await Project.create({
      title,
      description: description || '',
      deadline: deadline || null,
      department: dept,
      manager: assignedManagerId,
      createdBy: req.user._id,
      status: 'active',
    });

    await project.populate('manager', 'name email department title');
    await project.populate('createdBy', 'name email role');

    const managerName = project.manager ? project.manager.name : 'General Division';
    await Activity.create({
      user: req.user._id,
      action: 'PROJECT_CREATED',
      details: `${req.user.name} created project "${project.title}" assigned to Lead ${managerName}`,
      project: project._id,
    });

    res.status(201).json({
      success: true,
      message: 'Project created and assigned successfully',
      project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating project',
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Manager, Admin)
const updateProject = async (req, res) => {
  try {
    const { title, description, status, deadline, managerId, department } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (deadline !== undefined) project.deadline = deadline;
    if (department !== undefined) project.department = department;
    if (managerId !== undefined && req.user.role === 'admin') project.manager = managerId;

    await project.save();
    await project.populate('manager', 'name email department title');
    await project.populate('createdBy', 'name email role');

    await Activity.create({
      user: req.user._id,
      action: 'PROJECT_UPDATED',
      details: `${req.user.name} updated project: "${project.title}"`,
      project: project._id,
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project',
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Manager, Admin)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const title = project.title;
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    await Activity.create({
      user: req.user._id,
      action: 'PROJECT_DELETED',
      details: `${req.user.name} deleted project: "${title}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project',
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
