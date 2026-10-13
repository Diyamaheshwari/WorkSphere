const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// @desc    Register a new user (Starts as 'pending' for manager/admin approval)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, managerId, title } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const validRoles = ['user', 'manager', 'admin'];
    const assignedRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'user';

    // Users who register themselves start with 'pending' status awaiting approval
    const newUser = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Engineering',
      title: title || (assignedRole === 'manager' ? 'Team Lead' : 'Team Member'),
      manager: managerId || null,
      status: 'pending',
      isActive: true,
    });

    // Log Activity
    await Activity.create({
      user: newUser._id,
      action: 'USER_REGISTERED',
      details: `${newUser.name} registered as ${newUser.role} (Pending Approval)`,
    });

    res.status(201).json({
      success: true,
      isPending: true,
      message: 'Registration submitted! Your account is pending authorization by a Manager or Administrator.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token (Verifies approval status)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).populate('manager', 'name email');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check pending approval status
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        isPending: true,
        message: 'Your account is pending authorization by an Administrator or your Manager. Please check back once approved.',
      });
    }

    // Check rejected status
    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your registration request was not approved by workspace management.',
      });
    }

    // Check disabled status
    if (user.isActive === false || user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,
        status: user.status,
        manager: user.manager,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('manager', 'name email title department');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,
        status: user.status,
        manager: user.manager,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
