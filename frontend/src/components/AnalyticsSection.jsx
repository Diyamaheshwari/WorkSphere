export const AnalyticsSection = ({ stats = {}, teamWorkload = [] }) => {
  const completionRate = stats.completionRate ?? (
    stats.totalTasks > 0 ? Math.round(((stats.completed || 0) / stats.totalTasks) * 100) : 0
  );

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <span>📈</span>
        <span>Workspace Analytics & Team Workload</span>
      </h2>

      {/* Completion Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-gray-600">Task Completion Rate</span>
          <span className="text-xs font-bold text-blue-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 mt-1">
          <span>{stats.completed || 0} Tasks Completed</span>
          <span>{stats.totalTasks || 0} Total Tasks</span>
        </div>
      </div>

      {/* Team Workload Table / Cards */}
      {teamWorkload && teamWorkload.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Team Member Workload
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamWorkload.map((member, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between"
              >
                <div className="truncate max-w-[150px]">
                  <p className="text-xs font-bold text-gray-800 truncate">{member.userName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{member.userEmail}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {member.totalTasks} tasks
                  </span>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                    {member.completedTasks} done
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;
