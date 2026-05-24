import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiTrendingUp, FiCpu } from 'react-icons/fi';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-dark-950">
      {/* Left visual panel */}
      <div className="md:w-1/2 bg-gradient-to-tr from-primary-950 via-primary-900 to-indigo-950 text-white flex flex-col justify-between p-8 md:p-12 relative overflow-hidden select-none">
        {/* Subtle geometric grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Brand header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="bg-primary-500/20 p-2.5 rounded-xl border border-primary-400/20 backdrop-blur">
            <FiCpu className="h-6 w-6 text-primary-400 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
            LeadFlow CRM
          </span>
        </div>

        {/* Brand promotional message */}
        <div className="my-auto py-12 md:py-0 z-10 max-w-md">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 text-primary-300 px-3 py-1 rounded-full text-xs font-semibold border border-primary-400/10 mb-6">
            <FiTrendingUp className="h-3 w-3" />
            <span>Manufacturing BDA Pipeline Optimizer</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none mb-4">
            Accelerate Lead Cycles. Empower BDAs.
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Monitor real-time conversion dynamics, coordinate client follow-ups, and visualize key sales analytics in a high-performance workspace. Built for heavy industry.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-gray-400 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span>&copy; 2026 LeadFlow CRM System. All rights reserved.</span>
          <span className="hover:text-primary-400 cursor-pointer transition">v1.2.0 Stable</span>
        </div>
      </div>

      {/* Right form container */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 dark:bg-dark-950">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
// Prevent lint warning about HMR default
