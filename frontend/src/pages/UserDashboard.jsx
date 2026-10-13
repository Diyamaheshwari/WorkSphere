import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ActionPathBoard from '../components/ActionPathBoard';
import AnalyticsReportsView from '../components/AnalyticsReportsView';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CheckCircle2,
  Clock,
  Flame,
  Rocket,
  Calendar,
  FolderKanban,
  Check,
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('board');
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const [dashRes, tasksRes, projRes] = await Promise.all([
        api.get('/api/dashboard/user'),
        api.get('/api/tasks?myTasks=true'),
        api.get('/api/projects'),
      ]);

      setData(dashRes.data);
      setTasks(tasksRes.data.tasks || []);
      setProjects(projRes.data.projects || []);
    } catch (err) {
      console.error('Error fetching user dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      loadData();
    } catch (err) {
      console.error('Failed to change status:', err);
      loadData();
    }
  };

  const handleAddComment = async (taskId, text) => {
    try {
      await api.post(`/api/tasks/${taskId}/comments`, { text });
      loadData();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = data?.stats || {
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status !== 'completed').length,
    overdue: tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
      {/* Fixed Midnight Navy Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header
          title={
            activeTab === 'board'
              ? 'Personal Work Center'
              : activeTab === 'projects'
              ? "Today's Projects & Deadlines"
              : 'My Performance Analytics'
          }
          subtitle={`Reporting to: ${user?.manager?.name || 'Division Lead'} • ${user?.department || 'Engineering'}`}
          onSearch={setSearchQuery}
        />

        <main className="p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
          {/* Welcome Header & Metric Pills (matching Image 3) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
            <div className="mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Good morning, {user?.name ? user.name.split(' ')[0] : 'Member'}! 👋
              </h2>
              <p className="text-xs text-slate-500 mt-1">Let's make today productive!</p>
            </div>

            {/* Metric Pills Row (matching Image 3 top cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Completed Pill */}
              <div className="flex items-center space-x-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-lg font-extrabold text-slate-900 leading-none">
                    {stats.completed}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 ml-1.5">Completed</span>
                </div>
              </div>

              {/* Pending Pill */}
              <div className="flex items-center space-x-3 bg-amber-50/70 border border-amber-200/80 rounded-xl px-4 py-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-lg font-extrabold text-slate-900 leading-none">
                    {stats.pending}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 ml-1.5">Pending</span>
                </div>
              </div>

              {/* Overdue Pill */}
              <div className="flex items-center space-x-3 bg-rose-50/70 border border-rose-200/80 rounded-xl px-4 py-3">
                <Flame className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="text-lg font-extrabold text-slate-900 leading-none">
                    {stats.overdue}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 ml-1.5">Overdue</span>
                </div>
              </div>

              {/* In Progress Pill */}
              <div className="flex items-center space-x-3 bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-3">
                <Rocket className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-lg font-extrabold text-slate-900 leading-none">
                    {stats.inProgress || 3}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 ml-1.5">In Progress</span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: Action Path Kanban Board */}
          {activeTab === 'board' && (
            <div>
              <ActionPathBoard
                tasks={filteredTasks}
                teamMembers={[{ name: user?.name, title: user?.title, _id: user?.id }]}
                onStatusChange={handleStatusChange}
                onAddComment={handleAddComment}
                currentUserId={user?._id || user?.id}
                userRole={user?.role}
              />
            </div>
          )}

          {/* TAB 2: Today's Projects & Deadlines (matching Image 3 list) */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Today's Projects */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">Today's deliverables</h3>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {tasks.filter((t) => t.status !== 'completed').length}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start space-x-3.5">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() =>
                            handleStatusChange(
                              task._id,
                              task.status === 'completed' ? 'todo' : 'completed'
                            )
                          }
                          className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              task.status === 'completed'
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {task.project?.title || 'General Workspace'} • Progress: {task.progress || 0}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs shrink-0 pl-7 sm:pl-0">
                        {task.dueDate && (
                          <span className="flex items-center space-x-1 font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Workspace Projects */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h3 className="text-base font-bold text-slate-900 mb-4">Workspace Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <div
                      key={proj._id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{proj.description}</p>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                        <span>Lead: {proj.manager?.name || 'Division Lead'}</span>
                        {proj.deadline && (
                          <span>Target: {new Date(proj.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: My Performance Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsReportsView
              stats={{
                completionRate: stats.completionRate || 92.5,
                avgResponseTime: '1.8h',
                teamVelocity: 21.0,
                sprintSuccessRate: '95%',
              }}
              tasksByCategory={[
                { category: 'Development', count: tasks.filter((t) => t.category === 'Development').length },
                { category: 'Design', count: tasks.filter((t) => t.category === 'Design').length },
                { category: 'Testing', count: tasks.filter((t) => t.category === 'Testing').length },
                { category: 'Planning', count: tasks.filter((t) => t.category === 'Planning').length },
              ]}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
