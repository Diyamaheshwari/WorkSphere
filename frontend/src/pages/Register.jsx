import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Sparkles, ShieldCheck, ArrowRight, User, Mail, Lock, Building } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Backend & Cloud Infrastructure',
    managerId: '',
    title: 'Software Engineer',
  });

  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch active managers so new users can select who they report to
    const fetchManagers = async () => {
      try {
        const res = await api.get('/api/users/managers');
        const list = res.data.managers || [];
        setManagers(list);
        if (list.length > 0) {
          const match = list.find((m) => m.department === formData.department) || list[0];
          setFormData((prev) => ({ ...prev, managerId: match._id }));
        }
      } catch (err) {
        console.error('Error fetching managers:', err);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      const match = managers.find((m) => m.department === value);
      setFormData((prev) => ({
        ...prev,
        department: value,
        managerId: match ? match._id : (managers[0]?._id || ''),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user',
        department: formData.department,
        managerId: formData.managerId || null,
        title: formData.title,
      });

      setSubmittedSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-lg space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Registration Submitted</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Your account for <span className="font-bold text-slate-800">{formData.email}</span> has been submitted to your Division Manager and Workspace Admin for approval.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 text-left">
            <p className="font-semibold text-slate-800">Next Steps:</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Once approved, you will be able to sign in and immediately access your assigned projects and task boards.
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#172554] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">WorkSphere</span>
            <p className="text-xs text-indigo-300">Modern Enterprise Management</p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Join your division and start collaborating with your team.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            All accounts are securely verified by division managers to maintain access control and workspace integrity.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          WorkSphere v2.4 • Role-Based Access Control
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-10">
        <div className="w-full max-w-md space-y-4 sm:space-y-5">
          {/* Mobile Brand Logo (visible only on small screens) */}
          <div className="flex lg:hidden items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">WorkSphere</span>
              <p className="text-[10px] text-indigo-600 font-medium">Enterprise Management</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Create an account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your department and reporting manager to request workspace access.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rachel Green"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rachel@company.com"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Backend & Cloud Infrastructure">Backend & Cloud</option>
                  <option value="Product & Frontend Web">Frontend Web</option>
                  <option value="Product Design & UX">Design & UX</option>
                  <option value="QA & Security Operations">QA & Security</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Division Lead (Manager) *
                </label>
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  {managers.length === 0 && (
                    <option value="">Loading managers...</option>
                  )}
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} — {m.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Job Title / Role
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition duration-150 flex items-center justify-center space-x-2 text-xs disabled:opacity-70 cursor-pointer"
              >
                <span>{submitting ? 'Submitting request...' : 'Submit Request for Approval'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-600">
            Already authorized?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
