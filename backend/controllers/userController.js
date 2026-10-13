const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Get all users with team scoping
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { role, department, managerId, forAssignment } = req.query;
    let filter = {};

    if (role) filter.role = role;

    if (managerId) {
      const mgr = await User.findById(managerId);
      if (mgr && mgr.role === 'manager') {
        filter = {
          $or: [{ manager: managerId }, { department: mgr.department, role: 'user' }],
        };
      } else {
        // If managerId belongs to Admin or general, show all active team members for assignment
        filter = { role: 'user' };
      }
    } else if (department) {
      filter.department = department;
    }

    if (forAssignment === 'true') {
      filter.status = 'active';
      filter.isActive = true;
    }

    let users = await User.find(filter)
      .select('-password')
      .populate('manager', 'name email title department')
      .sort({ name: 1 });

    // Fallback: If filtered list is empty, return active users so assignment dropdown is never empty
    if (users.length === 0 && (managerId || forAssignment === 'true')) {
      users = await User.find({ role: 'user', isActive: true, status: 'active' })
        .select('-password')
        .populate('manager', 'name email title department')
        .sort({ name: 1 });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
    });
  }
};

// @desc    Get list of managers for team selection & assignment
// @route   GET /api/users/managers
// @access  Public / Private
const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager', isActive: true, status: 'active' })
      .select('name email department title avatar')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      managers,
    });
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve managers list',
    });
  }
};

// @desc    Get pending users awaiting approval
// @route   GET /api/users/pending
// @access  Private (Manager, Admin)
const getPendingUsers = async (req, res) => {
  try {
    const filter = { status: 'pending' };

    // If requester is a Manager, only show users assigned to their team or division
    if (req.user.role === 'manager') {
      filter.$or = [{ manager: req.user._id }, { department: req.user.department }];
    }

    const pendingUsers = await User.find(filter)
      .select('-password')
      .populate('manager', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending users',
    });
  }
};

// @desc    Approve a pending user
// @route   PUT /api/users/:id/approve
// @access  Private (Manager, Admin)
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'active';
    user.isActive = true;

    if (req.body.department) user.department = req.body.department;
    if (req.body.title) user.title = req.body.title;
    if (req.body.role && req.user.role === 'admin') user.role = req.body.role;

    await user.save();

    await Activity.create({
      user: req.user._id,
      action: 'USER_APPROVED',
      details: `${req.user.name} approved workspace access for ${user.name} (${user.role})`,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.name} approved successfully`,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,
        status: user.status,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving user',
    });
  }
};

// @desc    Reject a pending user
// @route   PUT /api/users/:id/reject
// @access  Private (Manager, Admin)
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'rejected';
    await user.save();

    await Activity.create({
      user: req.user._id,
      action: 'USER_REJECTED',
      details: `${req.user.name} rejected registration for ${user.name}`,
    });

    res.status(200).json({
      success: true,
      message: `Registration request for ${user.name} has been rejected`,
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting user',
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'manager', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await Activity.create({
      user: req.user._id,
      action: 'ROLE_UPDATED',
      details: `${req.user.name} changed role of ${user.name} from ${oldRole} to ${role}`,
    });

    res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      user,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ success: false, message: 'Error updating role' });
  }
};

// @desc    Update employee details (Department, Title, Manager, Role)
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { name, department, title, manager, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (title) user.title = title;
    if (manager !== undefined) user.manager = manager || null;
    if (role) user.role = role;

    await user.save();

    await Activity.create({
      user: req.user._id,
      action: 'USER_UPDATED',
      details: `${req.user.name} updated profile for ${user.name} (${user.role})`,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status (Active / Disabled)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account',
      });
    }

    user.isActive = !user.isActive;
    user.status = user.isActive ? 'active' : 'disabled';
    await user.save();

    const actionText = user.isActive ? 'activated' : 'deactivated';

    await Activity.create({
      user: req.user._id,
      action: 'USER_STATUS_UPDATED',
      details: `${req.user.name} ${actionText} account for ${user.name}`,
    });

    res.status(200).json({
      success: true,
      message: `User account ${actionText}`,
      user,
    });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({ success: false, message: 'Error toggling status' });
  }
};

// @desc    Create a user/manager account directly
// @route   POST /api/users
// @access  Private (Admin, Manager)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, title, managerId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    let assignedRole = role || 'user';
    let assignedManager = managerId || null;

    if (req.user.role === 'manager') {
      assignedRole = 'user';
      assignedManager = req.user._id;
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || req.user.department || 'General',
      title: title || (assignedRole === 'manager' ? 'Team Lead' : 'Team Member'),
      manager: assignedManager,
      status: 'active',
      isActive: true,
    });

    await Activity.create({
      user: req.user._id,
      action: 'USER_CREATED',
      details: `${req.user.name} created account for ${newUser.name} (${newUser.role})`,
    });

    res.status(201).json({
      success: true,
      message: 'Account created and activated successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getManagers,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserRole,
  updateUser,
  toggleUserStatus,
  createUser,
};
