import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldAlert, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setIsPendingNotice(false);
  };

  const handleQuickLogin = async (email, password) => {
    setFormData({ email, password });
    setError('');
    setIsPendingNotice(false);

    if (email === 'pending@example.com') {
      setIsPendingNotice(true);
      return;
    }

    try {
      setSubmitting(true);
      const userData = await login(email, password);
      if (userData?.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (userData?.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/user');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please provide your work email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setIsPendingNotice(false);

      const normalizedEmail = formData.email.trim().toLowerCase();
      const userData = await login(normalizedEmail, formData.password);

      if (userData?.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (userData?.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/user');
      }
    } catch (err) {
      console.error('[WorkSphere Login Error]:', err);
      if (err.response?.data?.isPending) {
        setIsPendingNotice(true);
      } else if (!err.response) {
        setError(
          'Backend server is waking up or unreachable. The live Render cloud server sleeps after inactivity and takes ~30–50s on the first attempt. Please wait a moment and try again.'
        );
      } else {
        setError(
          err.response?.data?.message || 'Invalid email or password. Please verify your credentials.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left Branding Panel (Midnight Navy #172554) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#172554] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">WorkSphere</span>
            <p className="text-xs text-indigo-300">Modern Enterprise Management</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-block bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3 py-1 text-xs font-semibold text-indigo-200">
            Enterprise RBAC Platform
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Connect teams, streamline delivery, and govern your workspace.
          </h2>
          <div className="space-y-3 pt-2 text-sm text-slate-300">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-tier permissions for Users, Managers, and Admins</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Interactive 4-column Action Path Kanban Board</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time Velocity & Team Workload Analytics</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400">
          WorkSphere v2.4 • Secured with JWT Stateless Tokens & Bcrypt
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Enter your corporate credentials to access your division workspace.
            </p>
          </div>

          {/* Pending Approval Notice */}
          {isPendingNotice && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-900 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Account Pending Authorization</p>
                <p className="mt-0.5 leading-relaxed">
                  Your account has been registered and is awaiting approval by your Division Manager or Workspace Administrator. You will receive access once approved.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition duration-150 flex items-center justify-center space-x-2 text-sm disabled:opacity-70 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Strip for Examiner/User Testing */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick One-Click Test Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <div className="font-bold text-slate-800">👑 Admin Portal</div>
                <div className="text-[10px] text-slate-500">Full Workspace Control • <span className="font-mono text-indigo-600">admin123</span></div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah@example.com', 'manager123')}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <div className="font-bold text-slate-800">👔 Manager Portal</div>
                <div className="text-[10px] text-slate-500">Sarah Jenkins • <span className="font-mono text-indigo-600">manager123</span></div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('user@example.com', 'user123')}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <div className="font-bold text-slate-800">👤 User Portal</div>
                <div className="text-[10px] text-slate-500">Alex Rivera • <span className="font-mono text-indigo-600">user123</span></div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('pending@example.com', 'user123')}
                className="p-2 text-left bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                <div className="font-bold text-amber-800">⏳ Test Pending Guard</div>
                <div className="text-[10px] text-amber-600">Jordan • <span className="font-mono text-amber-700">user123</span></div>
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <p className="text-center text-xs text-slate-600 pt-2">
            New employee?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Request workspace account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
