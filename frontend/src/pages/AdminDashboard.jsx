import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ActionPathBoard from '../components/ActionPathBoard';
import AnalyticsReportsView from '../components/AnalyticsReportsView';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  UserX,
  TrendingUp,
  FolderKanban,
  Award,
  Plus,
  Edit2,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [data, setData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: 'Backend & Cloud Infrastructure',
    title: 'Developer',
    managerId: '',
  });

  // Edit Employee State
  const [editingUser, setEditingUser] = useState(null);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.put(`/api/users/${editingUser._id}`, {
        name: editingUser.name,
        department: editingUser.department,
        title: editingUser.title,
        manager: editingUser.manager,
        role: editingUser.role,
      });
      setEditingUser(null);
      loadData();
    } catch (err) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  const loadData = async () => {
    try {
      const [dashRes, usersRes, pendingRes, tasksRes, projRes, actRes] = await Promise.all([
        api.get('/api/dashboard/admin'),
        api.get('/api/users'),
        api.get('/api/users/pending'),
        api.get('/api/tasks'),
        api.get('/api/projects'),
        api.get('/api/activities?limit=30'),
      ]);

      setData(dashRes.data);
      setUsersList(usersRes.data.users || []);
      setPendingUsers(pendingRes.data.users || []);
      setTasks(tasksRes.data.tasks || []);
      setProjects(projRes.data.projects || []);
      setActivities(actRes.data.activities || []);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveUser = async (userId) => {
    // Immediate optimistic update
    setPendingUsers((prev) => prev.filter((p) => p._id !== userId));
    setUsersList((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, status: 'active', isActive: true } : u
      )
    );
    try {
      await api.put(`/api/users/${userId}/approve`);
      loadData();
    } catch (err) {
      console.error('Error approving user:', err);
      loadData();
    }
  };

  const handleRejectUser = async (userId) => {
    // Immediate optimistic update
    setPendingUsers((prev) => prev.filter((p) => p._id !== userId));
    setUsersList((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, status: 'rejected', isActive: false } : u
      )
    );
    try {
      await api.put(`/api/users/${userId}/reject`);
      loadData();
    } catch (err) {
      console.error('Error rejecting user:', err);
      loadData();
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/users/${userId}/role`, { role: newRole });
      loadData();
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/api/users/${userId}/status`);
      loadData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users', newUser);
      setIsAddUserOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        department: 'Engineering',
        title: 'Developer',
      });
      loadData();
    } catch (err) {
      console.error('Error creating user:', err);
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const stats = data?.stats || {
    totalEmployees: usersList.filter((u) => u.isActive).length,
    activeManagers: usersList.filter((u) => u.role === 'manager').length,
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completionRate: 94.2,
    overdueTasks: tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length,
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar with pending count */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingUsers.length}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={
            activeTab === 'analytics'
              ? 'Company-Wide Control Center & Analytics'
              : activeTab === 'managers'
              ? 'Manager Performance Comparison'
              : activeTab === 'directory'
              ? 'Employee Directory & Access Approvals'
              : activeTab === 'board'
              ? 'Workspace Kanban Board'
              : activeTab === 'projects'
              ? 'Company Projects Portfolio'
              : 'Security & Audit Logs'
          }
          subtitle={`WorkSphere Enterprise • Signed in as Executive Administrator: ${user?.name}`}
          onSearch={setSearchQuery}
        >
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs transition"
          >
            + Invite Member
          </button>
        </Header>

        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top KPI Cards (matching SaaS enterprise design) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Total Employees</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalEmployees}</p>
              <p className="text-[11px] text-slate-400 mt-1">Across 4 divisions</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Active Managers</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.activeManagers}</p>
              <p className="text-[11px] text-purple-600 font-medium mt-1">Division team leads</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Company Completion Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.completionRate}%</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Overall task velocity</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600">{pendingUsers.length}</p>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Awaiting verification</p>
            </div>
          </div>

          {/* TAB 1: Analytics & Reports (matching Image 1) */}
          {activeTab === 'analytics' && (
            <AnalyticsReportsView
              stats={stats}
              tasksByCategory={data?.tasksByCategory || []}
              monthlyProgress={data?.monthlyProgress || []}
            />
          )}

          {/* TAB 2: Manager Performance Comparison */}
          {activeTab === 'managers' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Division Manager Performance Comparison
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Evaluate team productivity, completion rates, and workload balance across all 4 managers
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-3 px-4">Manager Name</th>
                        <th className="py-3 px-4">Division / Department</th>
                        <th className="py-3 px-4 text-center">Team Size</th>
                        <th className="py-3 px-4 text-center">Tasks Assigned</th>
                        <th className="py-3 px-4 text-center">Completed</th>
                        <th className="py-3 px-4 text-center">Overdue</th>
                        <th className="py-3 px-4 text-center">Completion Rate</th>
                        <th className="py-3 px-4 text-right">Efficiency Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.managerComparison || []).map((m) => (
                        <tr key={m._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{m.name}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{m.email}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{m.department}</td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                            {m.teamSize} members
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                            {m.totalTasks}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                            {m.completedTasks}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                            {m.overdueTasks}
                          </td>
                          <td className="py-3.5 px-4 text-center font-extrabold text-slate-900">
                            {m.completionRate}%
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                m.efficiency === 'High'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {m.efficiency}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Employee Directory & Access Approvals */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Pending Approvals Section */}
              {pendingUsers.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-2xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-amber-700" />
                    <h3 className="text-base font-bold text-amber-900">
                      Pending Workspace Access Requests ({pendingUsers.length})
                    </h3>
                  </div>
                  <p className="text-xs text-amber-700 mb-4">
                    New employees who self-registered. Authorize their account to allow sign-in.
                  </p>

                  <div className="divide-y divide-amber-200/60">
                    {pendingUsers.map((p) => (
                      <div key={p._id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">
                            {p.email} • Requested: {p.role} ({p.department})
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveUser(p._id)}
                            className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Authorize & Activate</span>
                          </button>
                          <button
                            onClick={() => handleRejectUser(p._id)}
                            className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
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

              {/* Full Employee Directory Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Company Employee Directory</h3>
                    <p className="text-xs text-slate-500">
                      Manage roles, team assignments, and activation status
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition"
                  >
                    + Add Employee
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Department & Title</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Assigned Manager</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map((u) => {
                        const isSelf = u._id === user?.id || u._id === user?._id;
                        const managerObj = usersList.find((m) => m._id === u.manager);

                        return (
                          <tr key={u._id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div>{u.name} {isSelf && <span className="text-indigo-600">(You)</span>}</div>
                              <span className="text-[10px] text-slate-400 font-normal">{u.email}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              <div>{u.department || 'General'}</div>
                              <span className="text-[10px] text-slate-400">{u.title || 'Team Member'}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-xs">
                              {u.role === 'manager' ? (
                                <span className="text-purple-600 font-bold text-[11px]">Division Lead</span>
                              ) : u.role === 'admin' ? (
                                <span className="text-indigo-600 font-bold text-[11px]">Executive Admin</span>
                              ) : managerObj ? (
                                <span className="font-semibold text-slate-800">{managerObj.name}</span>
                              ) : (
                                <span className="text-slate-400 italic">None</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  u.isActive && u.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : u.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {u.status || (u.isActive ? 'Active' : 'Disabled')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => setEditingUser({ ...u })}
                                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition flex items-center space-x-1"
                                  title="Edit profile & assigned manager"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                {u.status === 'pending' ? (
                                  <button
                                    onClick={() => handleApproveUser(u._id)}
                                    className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                                  >
                                    Authorize
                                  </button>
                                ) : (
                                  <button
                                    disabled={isSelf}
                                    onClick={() => handleToggleStatus(u._id)}
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                                      u.isActive
                                        ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600'
                                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                  >
                                    {u.isActive ? 'Deactivate' : 'Reactivate'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Workspace 4-Column Board (matching Image 2) */}
          {activeTab === 'board' && (
            <ActionPathBoard
              tasks={tasks}
              teamMembers={usersList}
              onStatusChange={async (taskId, newStatus) => {
                await api.put(`/api/tasks/${taskId}`, { status: newStatus });
                loadData();
              }}
              onEditTask={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={async (taskId) => {
                if (window.confirm('Delete task?')) {
                  await api.delete(`/api/tasks/${taskId}`);
                  loadData();
                }
              }}
              onAddComment={async (taskId, text) => {
                await api.post(`/api/tasks/${taskId}/comments`, { text });
                loadData();
              }}
              onCreateTask={() => {
                setSelectedTask(null);
                setIsTaskModalOpen(true);
              }}
              currentUserId={user?._id || user?.id}
              userRole="admin"
            />
          )}

          {/* TAB 5: Projects */}
          {activeTab === 'projects' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Company Project Portfolio</h3>
                  <p className="text-xs text-slate-500">
                    Assign projects directly to Division Managers to lead their teams
                  </p>
                </div>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create & Assign Project</span>
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
                      <span>Division: {proj.department || proj.manager?.department || 'General'}</span>
                      <span className="font-medium text-slate-700">
                        Manager: <strong className="text-slate-900">{proj.manager?.name || 'Unassigned'}</strong>
                      </span>
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

          {/* TAB 6: Audit Logs */}
          {activeTab === 'audit' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">Company Security & Audit Logs</h3>
              <p className="text-xs text-slate-500 mb-5">
                Immutable chronological log of all authorization and workspace events
              </p>
              <ActivityTimeline activities={activities} />
            </div>
          )}
        </main>
      </div>

      {/* Invite Member Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Invite / Create Workspace Account
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Rachel Green"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. rachel@example.com"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="user">User (Team Member)</option>
                    <option value="manager">Manager (Division Lead)</option>
                    <option value="admin">Admin (Executive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Division *</label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="Backend & Cloud Infrastructure">Backend & Cloud</option>
                    <option value="Product & Frontend Web">Frontend Web</option>
                    <option value="Product Design & UX">Design & UX</option>
                    <option value="QA & Security Operations">QA & Security</option>
                  </select>
                </div>
              </div>

              {newUser.role === 'user' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign Reporting Manager
                  </label>
                  <select
                    value={newUser.managerId}
                    onChange={(e) => setNewUser({ ...newUser, managerId: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {usersList
                      .filter((u) => u.role === 'manager')
                      .map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.department})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-xs font-semibold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Create & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Edit Employee Profile & Assignments
            </h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-100 text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="Backend & Cloud Infrastructure">Backend & Cloud</option>
                    <option value="Product & Frontend Web">Frontend Web</option>
                    <option value="Product Design & UX">Design & UX</option>
                    <option value="QA & Security Operations">QA & Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editingUser.title || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {editingUser.role === 'user' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign Division Manager
                  </label>
                  <select
                    value={editingUser.manager || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, manager: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {usersList
                      .filter((u) => u.role === 'manager' && u._id !== editingUser._id)
                      .map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.department})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 text-xs font-semibold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={async (tData) => {
          if (selectedTask) {
            await api.put(`/api/tasks/${selectedTask._id}`, tData);
          } else {
            await api.post('/api/tasks', tData);
          }
          setIsTaskModalOpen(false);
          loadData();
        }}
        task={selectedTask}
        projects={projects}
        users={usersList}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={async (pData) => {
          await api.post('/api/projects', pData);
          setIsProjectModalOpen(false);
          loadData();
        }}
        managers={usersList.filter((u) => u.role === 'manager')}
      />
    </div>
  );
};

export default AdminDashboard;
