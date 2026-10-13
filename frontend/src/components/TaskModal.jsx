import { useState, useEffect } from 'react';
import api from '../services/api';

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  task = null,
  projects = [],
  users = [],
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'medium',
    health: 'on_track',
    progress: 0,
    category: 'Development',
    dueDate: '',
  });

  const [availableUsers, setAvailableUsers] = useState(users);

  useEffect(() => {
    if (users && users.length > 0) {
      setAvailableUsers(users);
    } else if (isOpen) {
      // Auto-fetch active users for assignment if not provided
      api.get('/api/users?forAssignment=true').then((res) => {
        setAvailableUsers(res.data.users || []);
      });
    }
  }, [isOpen, users]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        priority: task.priority || 'medium',
        health: task.health || 'on_track',
        progress: task.progress || 0,
        category: task.category || 'Development',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        project: projects[0]?._id || '',
        assignedTo: '',
        priority: 'medium',
        health: 'on_track',
        progress: 0,
        category: 'Development',
        dueDate: '',
      });
    }
  }, [task, projects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement Payment Webhooks"
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add key requirements or details..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project
              </label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:outline-none"
              >
                <option value="">General (No Project)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assign To Team Member *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
              >
                <option value="">Select Assignee</option>
                {availableUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} — {u.title || u.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:outline-none"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Testing">Testing</option>
                <option value="Documentation">Documentation</option>
                <option value="Planning">Planning</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Health Status
              </label>
              <select
                value={formData.health}
                onChange={(e) => setFormData({ ...formData, health: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:outline-none"
              >
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="behind">Behind</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Progress ({formData.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
