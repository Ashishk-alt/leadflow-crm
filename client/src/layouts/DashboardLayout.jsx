import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  FiMenu, FiX, FiLayers, FiDatabase, FiTrello, FiUser, 
  FiLogOut, FiSun, FiMoon, FiCpu, FiExternalLink 
} from 'react-icons/fi';

const DashboardLayout = () => {
  const { user, isAuthenticated, loading, logoutUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const location = useLocation();

  // Dark mode trigger
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Route protection
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiLayers },
    { name: 'Leads Database', path: '/leads', icon: FiDatabase },
    { name: 'Kanban Pipeline', path: '/pipeline', icon: FiTrello },
    { name: 'My Profile', path: '/profile', icon: FiUser },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-950 text-gray-800 dark:text-gray-200">
      
      {/* 1. Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-dark-950/40 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={toggleSidebar}
        />
      )}

      {/* 2. Sidebar Navigation Component */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800
        transform lg:transform-none lg:opacity-100 lg:static transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col justify-between
      `}>
        {/* Sidebar Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-900/50">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="bg-primary-600 p-2 rounded-lg text-white">
                <FiCpu className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                LeadFlow CRM
              </span>
            </Link>
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500" onClick={toggleSidebar}>
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-100/50 dark:border-primary-900/30 shadow-sm' 
                      : 'hover:bg-gray-50 dark:hover:bg-dark-800/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Current User Panel */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-900/30">
          <div className="flex items-center space-x-3 px-2 py-1.5">
            <div className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm select-none border border-primary-500 shadow-sm">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <span className="inline-block bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase mt-0.5 tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. Main Dashboard Wrapper Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm/5">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-lg border border-gray-200 dark:border-dark-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800 transition"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:block">
              {navigationItems.find(item => item.path === location.pathname)?.name || 'LeadFlow CRM'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-gray-200 dark:border-dark-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800 transition duration-200 shadow-sm bg-white dark:bg-dark-900"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <FiSun className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" /> : <FiMoon className="h-4.5 w-4.5" />}
            </button>

            {/* Logout Trigger */}
            <button 
              onClick={logoutUser}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-dark-800 hover:border-red-100 dark:hover:border-red-900/30 transition duration-200 text-xs font-medium shadow-sm bg-white dark:bg-dark-900"
            >
              <FiLogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-dark-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
