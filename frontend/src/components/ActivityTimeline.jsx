export const ActivityTimeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm italic">
        No activity logs recorded yet.
      </div>
    );
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'TASK_CREATED':
        return '✨';
      case 'TASK_STATUS_UPDATED':
        return '🔄';
      case 'COMMENT_ADDED':
        return '💬';
      case 'PROJECT_CREATED':
        return '📁';
      case 'ROLE_UPDATED':
        return '🛡️';
      case 'USER_STATUS_UPDATED':
        return '👤';
      default:
        return '📝';
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
      {activities.map((act) => (
        <div
          key={act._id}
          className="flex items-start space-x-3 p-3 bg-gray-50/70 hover:bg-gray-100 rounded-lg transition border border-gray-100"
        >
          <span className="text-xl shrink-0 mt-0.5">{getActionIcon(act.action)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-800 font-medium leading-snug">
              {act.details}
            </p>
            <div className="flex items-center space-x-2 mt-1 text-[11px] text-gray-500">
              <span className="font-semibold text-gray-700">{act.user?.name || 'System'}</span>
              <span>•</span>
              <span>{formatTimeAgo(act.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
