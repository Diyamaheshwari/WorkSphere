import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ActionPathBoard from '../components/ActionPathBoard';
import AnalyticsReportsView from '../components/AnalyticsReportsView';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
  ChevronDown,
} from 'lucide-react';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('board');
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Initial load: fetch managers list if admin, then load manager dashboard
  useEffect(() => {
    const init = async () => {
      try {
        const mgrRes = await api.get('/api/users/managers');
        const mgrs = mgrRes.data.managers || [];
        setManagersList(mgrs);

        let initialMgrId = '';
        if (user?.role === 'manager') {
          initialMgrId = user?._id || user?.id;
        } else if (mgrs.length > 0) {
          initialMgrId = mgrs[0]._id; // Default Admin view to first manager (Sarah Jenkins)
        }
        setSelectedManagerId(initialMgrId);
        loadData(initialMgrId);
      } catch (err) {
        console.error('Error initializing manager dashboard:', err);
        loadData(user?._id || user?.id);
      }
    };
    init();
  }, [user]);

  const loadData = async (mgrId) => {
    const effectiveMgrId = mgrId || selectedManagerId || (user?.role === 'manager' ? user?._id : '');
    try {
      const [dashRes, tasksRes, usersRes, pendingRes, projRes] = await Promise.all([
        api.get(`/api/dashboard/manager${effectiveMgrId ? `?managerId=${effectiveMgrId}` : ''}`),
        api.get(`/api/tasks${effectiveMgrId ? `?managerId=${effectiveMgrId}` : ''}`),
        api.get(`/api/users?forAssignment=true${effectiveMgrId ? `&managerId=${effectiveMgrId}` : ''}`),
        api.get('/api/users/pending'),
        api.get(`/api/projects${effectiveMgrId ? `?managerId=${effectiveMgrId}` : ''}`),
      ]);

      setData(dashRes.data);
      setTasks(tasksRes.data.tasks || []);
      setTeamMembers(usersRes.data.users || []);
      setPendingUsers(pendingRes.data.users || []);
      setProjects(projRes.data.projects || []);
    } catch (err) {
      console.error('Error fetching manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerSwitch = (newMgrId) => {
    setSelectedManagerId(newMgrId);
    loadData(newMgrId);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      loadData(selectedManagerId);
    } catch (err) {
      console.error('Failed to update task:', err);
      loadData(selectedManagerId);
    }
  };

  const handleCreateOrUpdateTask = async (taskFormData) => {
    try {
      if (selectedTask) {
        await api.put(`/api/tasks/${selectedTask._id}`, taskFormData);
      } else {
        await api.post('/api/tasks', taskFormData);
      }
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      loadData(selectedManagerId);
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      loadData(selectedManagerId);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setPendingUsers((prev) => prev.filter((p) => p._id !== userId));
      await api.put(`/api/users/${userId}/approve`);
      loadData(selectedManagerId);
    } catch (err) {
      console.error('Error approving user:', err);
      loadData(selectedManagerId);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      setPendingUsers((prev) => prev.filter((p) => p._id !== userId));
      await api.put(`/api/users/${userId}/reject`);
      loadData(selectedManagerId);
    } catch (err) {
      console.error('Error rejecting user:', err);
      loadData(selectedManagerId);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignedTo?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeManagerObj =
    managersList.find((m) => m._id === selectedManagerId) ||
    data?.activeManager ||
    user;

  const stats = data?.stats || {
    teamCount: teamMembers.length,
    activeProjects: projects.length,
    totalTasks: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    inReview: tasks.filter((t) => t.status === 'review').length,
    overdue: tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length,
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar with Pending Badges */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingUsers.length}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={
            activeTab === 'board'
              ? 'Team Operations Workspace'
              : activeTab === 'analytics'
              ? 'Team Performance & Velocity'
              : activeTab === 'team'
              ? 'Team Members & Access Approvals'
              : 'Projects Overview'
          }
          subtitle={`${activeManagerObj?.department || 'Division'} • Lead: ${activeManagerObj?.name}`}
          onSearch={setSearchQuery}
        >
          <div className="flex items-center space-x-2">
            {/* If Admin is viewing, show Division Switcher dropdown */}
            {user?.role === 'admin' && managersList.length > 0 && (
              <div className="relative">
                <select
                  value={selectedManagerId}
                  onChange={(e) => handleManagerSwitch(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none cursor-pointer"
                >
                  {managersList.map((m) => (
                    <option key={m._id} value={m._id}>
                      Division: {m.name} ({m.department.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-1.5 rounded-xl transition shadow-2xs"
            >
              + Project
            </button>
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsTaskModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition shadow-2xs"
            >
              + Assign Task
            </button>
          </div>
        </Header>

        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Team Size</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{teamMembers.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Engineers in {activeManagerObj?.department?.split(' ')[0] || 'division'}
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Completion Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.completionRate || '94.2'}%</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {stats.completed} of {stats.totalTasks} tasks done
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">In Progress / Review</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {(stats.inProgress || 0) + (stats.inReview || 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Active sprint deliverables</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Overdue Deliverables</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-rose-600">{stats.overdue || 0}</p>
              <p className="text-[11px] text-rose-500 font-medium mt-1">
                {stats.overdue > 0 ? 'Requires attention' : 'All milestones on track'}
              </p>
            </div>
          </div>

          {/* TAB 1: Team Action Path Kanban Board */}
          {activeTab === 'board' && (
            <ActionPathBoard
              tasks={filteredTasks}
              teamMembers={teamMembers}
              onStatusChange={handleStatusChange}
              onEditTask={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onAddComment={async (taskId, text) => {
                await api.post(`/api/tasks/${taskId}/comments`, { text });
                loadData(selectedManagerId);
              }}
              onCreateTask={() => {
                setSelectedTask(null);
                setIsTaskModalOpen(true);
              }}
              currentUserId={user?._id || user?.id}
              userRole={user?.role}
            />
          )}

          {/* TAB 2: Team Analytics (matching Image 1) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <AnalyticsReportsView
                stats={stats}
                tasksByCategory={data?.categoryBreakdown || []}
              />

              {/* Individual Team Member Performance */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Individual Team Member Performance
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Tasks assigned, completed, and workload breakdown
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4 text-center">Assigned</th>
                        <th className="py-3 px-4 text-center">Completed</th>
                        <th className="py-3 px-4 text-center">Overdue</th>
                        <th className="py-3 px-4 text-right">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.memberPerformance || []).map((m) => (
                        <tr key={m._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{m.name}</td>
                          <td className="py-3.5 px-4 text-slate-500">{m.title}</td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                            {m.totalTasks}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                            {m.completedTasks}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                            {m.overdueTasks}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-slate-800">{m.completionRate}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Team Members & Approvals */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Pending Approvals */}
              {pendingUsers.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-2xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-amber-700" />
                    <h3 className="text-base font-bold text-amber-900">
                      Pending Team Member Approvals ({pendingUsers.length})
                    </h3>
                  </div>
                  <p className="text-xs text-amber-700 mb-4">
                    New users who registered to join your team. Verify and authorize their workspace access.
                  </p>

                  <div className="divide-y divide-amber-200/60">
                    {pendingUsers.map((p) => (
                      <div
                        key={p._id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">
                            {p.email} • Requested: {p.title || 'Team Member'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveUser(p._id)}
                            className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Authorize & Activate</span>
                          </button>
                          <button
                            onClick={() => handleRejectUser(p._id)}
                            className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Team Members List */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Active Team Roster ({teamMembers.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Engineers assigned to {activeManagerObj?.department || 'division'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-300 transition shadow-2xs"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            {member.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{member.title}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-3">{member.email}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="font-semibold text-indigo-600">
                          {tasks.filter((t) => t.assignedTo?._id === member._id).length} Active Tasks
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Projects */}
          {activeTab === 'projects' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Division Projects</h3>
                  <p className="text-xs text-slate-500">
                    Initiatives assigned to {activeManagerObj?.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition"
                >
                  + Create & Assign Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div key={proj._id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">{proj.description}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-200">
                      <span>Assigned Manager: {proj.manager?.name || activeManagerObj?.name}</span>
                      {proj.deadline && (
                        <span className="font-semibold text-indigo-600">
                          Due: {new Date(proj.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Task & Project Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        task={selectedTask}
        projects={projects}
        users={teamMembers}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={async (pData) => {
          await api.post('/api/projects', pData);
          setIsProjectModalOpen(false);
          loadData(selectedManagerId);
        }}
        managers={managersList}
      />
    </div>
  );
};

export default ManagerDashboard;
