import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, ChevronDown, CheckCircle2 } from 'lucide-react';

export const Header = ({ title, subtitle, onSearch, children }) => {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Title and Subtitle */}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>

        {/* Search, Action Buttons & User Profile */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full md:w-auto">
          {/* Custom Action buttons passed from pages */}
          {children}

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64 sm:flex-initial min-w-[140px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
          </button>

          {/* User Profile Pill (matching Image 1 top right) */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 shrink-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
