const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @desc    Get user dashboard personal data & metrics
// @route   GET /api/dashboard/user
// @access  Private
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [todoCount, inProgressCount, reviewCount, completedCount, overdueCount] =
      await Promise.all([
        Task.countDocuments({ assignedTo: userId, status: 'todo' }),
        Task.countDocuments({ assignedTo: userId, status: 'in_progress' }),
        Task.countDocuments({ assignedTo: userId, status: 'review' }),
        Task.countDocuments({ assignedTo: userId, status: 'completed' }),
        Task.countDocuments({
          assignedTo: userId,
          status: { $ne: 'completed' },
          dueDate: { $lt: now },
        }),
      ]);

    const totalTasks = todoCount + inProgressCount + reviewCount + completedCount;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Upcoming & Today projects where user has tasks
    const userTasks = await Task.find({ assignedTo: userId }).populate('project');
    const projectIds = [...new Set(userTasks.map((t) => t.project?._id).filter(Boolean))];
    const userProjects = await Project.find({ _id: { $in: projectIds } }).populate('manager', 'name email title');

    res.status(200).json({
      success: true,
      user: req.user,
      stats: {
        completed: completedCount,
        pending: inProgressCount + todoCount + reviewCount,
        overdue: overdueCount,
        inProgress: inProgressCount,
        review: reviewCount,
        total: totalTasks,
        completionRate,
      },
      projects: userProjects,
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving user dashboard data' });
  }
};

// @desc    Get manager dashboard & team operations data
// @route   GET /api/dashboard/manager
// @access  Private (Manager, Admin)
const getManagerDashboard = async (req, res) => {
  try {
    const now = new Date();
    let managerId = null;

    if (req.user.role === 'manager') {
      managerId = req.user._id;
    } else if (req.query.managerId) {
      managerId = req.query.managerId;
    } else {
      // If admin visits without query, default to first active manager (Sarah Jenkins)
      const firstMgr = await User.findOne({ role: 'manager', isActive: true });
      if (firstMgr) managerId = firstMgr._id;
    }

    const currentManager = managerId ? await User.findById(managerId) : null;

    // Filter team members by manager reference OR matching department
    const teamFilter = currentManager
      ? {
          $or: [{ manager: currentManager._id }, { department: currentManager.department, role: 'user' }],
          isActive: true,
          status: 'active',
        }
      : { role: 'user', isActive: true, status: 'active' };

    const taskFilter = currentManager
      ? { $or: [{ manager: currentManager._id }, { createdBy: currentManager._id }] }
      : {};

    const [teamMembers, teamTasks, activeProjects] = await Promise.all([
      User.find(teamFilter).select('name email role title department avatar'),
      Task.find(taskFilter).populate('assignedTo', 'name email title avatar'),
      Project.find(currentManager ? { manager: currentManager._id } : {}),
    ]);

    const completed = teamTasks.filter((t) => t.status === 'completed').length;
    const inProgress = teamTasks.filter((t) => t.status === 'in_progress').length;
    const inReview = teamTasks.filter((t) => t.status === 'review').length;
    const todo = teamTasks.filter((t) => t.status === 'todo').length;
    const overdue = teamTasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length;
    const atRisk = teamTasks.filter((t) => t.health === 'at_risk' || t.health === 'behind').length;

    const totalTasks = teamTasks.length;
    const completionRate = totalTasks > 0 ? ((completed / totalTasks) * 100).toFixed(1) : 0;

    // Category breakdown
    const categories = ['Development', 'Design', 'Testing', 'Documentation', 'Planning', 'Other'];
    const categoryBreakdown = categories.map((cat) => ({
      category: cat,
      count: teamTasks.filter((t) => t.category === cat).length,
    }));

    // Member performance breakdown
    const memberPerformance = teamMembers.map((member) => {
      const memberTasks = teamTasks.filter((t) => t.assignedTo?._id?.toString() === member._id.toString());
      const mCompleted = memberTasks.filter((t) => t.status === 'completed').length;
      const mOverdue = memberTasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length;
      const mRate = memberTasks.length > 0 ? Math.round((mCompleted / memberTasks.length) * 100) : 0;

      return {
        _id: member._id,
        name: member.name,
        email: member.email,
        title: member.title,
        totalTasks: memberTasks.length,
        completedTasks: mCompleted,
        pendingTasks: memberTasks.length - mCompleted,
        overdueTasks: mOverdue,
        completionRate: mRate,
      };
    });

    res.status(200).json({
      success: true,
      activeManager: currentManager,
      stats: {
        teamCount: teamMembers.length,
        activeProjects: activeProjects.length,
        totalTasks,
        completed,
        inProgress,
        inReview,
        todo,
        overdue,
        atRisk,
        completionRate: parseFloat(completionRate),
        velocity: 18.5,
        avgResponseTime: '2.4h',
        sprintSuccessRate: '87%',
      },
      categoryBreakdown,
      memberPerformance,
      projects: activeProjects,
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving manager dashboard data' });
  }
};

// @desc    Get admin company-wide control center & manager performance comparison
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();

    const [
      managers,
      allUsers,
      allTasks,
      allProjects,
      pendingCount,
    ] = await Promise.all([
      User.find({ role: 'manager' }).select('name email department title'),
      User.find().select('name email role department status isActive manager title'),
      Task.find().populate('assignedTo', 'name email').populate('manager', 'name email'),
      Project.find().populate('manager', 'name email title department'),
      User.countDocuments({ status: 'pending' }),
    ]);

    const activeEmployees = allUsers.filter((u) => u.isActive && u.status === 'active');
    const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
    const overdueTasks = allTasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length;
    const projectsAtRisk = allProjects.filter((p) => p.status === 'at_risk' || (p.deadline && new Date(p.deadline) < now)).length;

    const totalTasks = allTasks.length;
    const companyCompletionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';

    // 1. Manager Performance Comparison (Counts actual team members per manager)
    const managerComparison = managers.map((mgr) => {
      const mgrTasks = allTasks.filter(
        (t) => t.manager?._id?.toString() === mgr._id.toString() || t.createdBy?.toString() === mgr._id.toString()
      );

      // Match by manager reference OR by department for team members
      const teamUsers = allUsers.filter(
        (u) =>
          u.role === 'user' &&
          ((u.manager && u.manager.toString() === mgr._id.toString()) ||
            u.department === mgr.department)
      );

      const mCompleted = mgrTasks.filter((t) => t.status === 'completed').length;
      const mOverdue = mgrTasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length;
      const mRate = mgrTasks.length > 0 ? Math.round((mCompleted / mgrTasks.length) * 100) : 0;

      return {
        _id: mgr._id,
        name: mgr.name,
        email: mgr.email,
        department: mgr.department,
        teamSize: teamUsers.length,
        totalTasks: mgrTasks.length,
        completedTasks: mCompleted,
        overdueTasks: mOverdue,
        completionRate: mRate,
        efficiency: mRate > 80 ? 'High' : mRate > 50 ? 'Moderate' : 'Needs Attention',
      };
    });

    // 2. Category distribution
    const categories = ['Development', 'Design', 'Testing', 'Documentation', 'Planning', 'Other'];
    const tasksByCategory = categories.map((cat) => ({
      category: cat,
      count: allTasks.filter((t) => t.category === cat).length,
    }));

    // 3. Monthly Trends
    const monthlyProgress = [
      { month: 'Jan', completed: 45, created: 50 },
      { month: 'Feb', completed: 58, created: 62 },
      { month: 'Mar', completed: 70, created: 65 },
      { month: 'Apr', completed: 85, created: 78 },
      { month: 'May', completed: 92, created: 88 },
      { month: 'Jun', completed: completedTasks, created: totalTasks },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees: activeEmployees.length,
        activeManagers: managers.length,
        totalProjects: allProjects.length,
        totalTasks,
        completedTasks,
        overdueTasks,
        projectsAtRisk,
        pendingApprovals: pendingCount,
        completionRate: parseFloat(companyCompletionRate),
        avgResponseTime: '2.4h',
        teamVelocity: 18.5,
        sprintSuccessRate: '87%',
      },
      managerComparison,
      tasksByCategory,
      monthlyProgress,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving admin dashboard data' });
  }
};

module.exports = {
  getUserDashboard,
  getManagerDashboard,
  getAdminDashboard,
};
