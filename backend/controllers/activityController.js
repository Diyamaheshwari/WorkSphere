const Activity = require('../models/Activity');

// @desc    Get recent activity timeline and audit logs
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const activities = await Activity.find()
      .populate('user', 'name email role')
      .populate('task', 'title status')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving activities',
    });
  }
};

module.exports = {
  getActivities,
};
