import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  BarChart3,
  Users,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ activeTab, onTabChange, pendingCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'user';

  // Navigation items based on role
  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
        { id: 'board', label: 'Workspace Board', icon: CheckSquare },
        { id: 'managers', label: 'Manager Comparison', icon: Users },
        { id: 'directory', label: 'Employees & Approvals', icon: ShieldCheck, badge: pendingCount },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'audit', label: 'Audit Logs', icon: FileText },
      ];
    } else if (role === 'manager') {
      return [
        { id: 'board', label: 'Team Kanban Board', icon: CheckSquare },
        { id: 'analytics', label: 'Team Analytics', icon: BarChart3 },
        { id: 'team', label: 'Team Members', icon: Users, badge: pendingCount },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
      ];
    } else {
      return [
        { id: 'board', label: 'My Tasks & Board', icon: CheckSquare },
        { id: 'projects', label: "Today's Projects", icon: FolderKanban },
        { id: 'analytics', label: 'My Performance', icon: BarChart3 },
      ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadgeColor = () => {
    if (role === 'admin') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    if (role === 'manager') return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#172554] text-slate-200 w-64 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">WorkSphere</h1>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Workspace</p>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Portal Switching Shortcuts for Admin / Manager */}
        {role === 'admin' && (
          <div className="pt-6">
            <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Switch Perspective
            </div>
            <Link
              to="/dashboard/manager"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <span>View as Manager</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/dashboard/user"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <span>View as User</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {role === 'manager' && (
          <div className="pt-6">
            <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Switch Perspective
            </div>
            <Link
              to="/dashboard/user"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <span>View as User</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* User Profile Widget */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {user?.name}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor()}`}
                >
                  {user?.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                  {user?.department || 'Member'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/70 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Header Bar with Hamburger */}
      <div className="md:hidden flex items-center justify-between w-full px-4 py-3 bg-[#172554] text-white sticky top-0 z-40 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base">WorkSphere</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          ></div>
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
