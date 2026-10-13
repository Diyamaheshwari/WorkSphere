import { useState, useEffect } from 'react';
import api from '../services/api';

export const ProjectModal = ({ isOpen, onClose, onSubmit, managers = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    managerId: '',
  });

  const [managerList, setManagerList] = useState(managers);

  useEffect(() => {
    if (managers && managers.length > 0) {
      setManagerList(managers);
      if (!formData.managerId) {
        setFormData((prev) => ({ ...prev, managerId: managers[0]._id }));
      }
    } else if (isOpen) {
      api.get('/api/users/managers').then((res) => {
        const mgrs = res.data.managers || [];
        setManagerList(mgrs);
        if (mgrs.length > 0 && !formData.managerId) {
          setFormData((prev) => ({ ...prev, managerId: mgrs[0]._id }));
        }
      });
    }
  }, [isOpen, managers]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    setFormData({ title: '', description: '', deadline: '', managerId: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Create & Assign Project</h3>
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
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. WorkSphere Mobile App V2"
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key deliverables, scope, and objectives..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Division Manager *
            </label>
            <select
              required
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select Division Manager</option>
              {managerList.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} — {m.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
              Create & Assign Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
