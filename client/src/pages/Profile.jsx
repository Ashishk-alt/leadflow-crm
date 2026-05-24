import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import leadService from '../services/leadService';
import { FiUser, FiMail, FiBriefcase, FiGrid, FiTrendingUp, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await leadService.getStats();
      if (res.success) {
        setStats(res.data.summary);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Formatter for Currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">BDA Account Workspace</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Account details, workforce status, and localized BDA performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Contact Information Card */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Massive Circular Initials Avatar */}
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl select-none border border-primary-500 shadow-md">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <span className="inline-block bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 tracking-wider border border-primary-200/20">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-dark-800/60 space-y-4 text-xs">
            {/* Email field */}
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <FiMail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Role field */}
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <FiBriefcase className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Designation / Role</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                  {user?.role === 'BDA' && 'Business Development Associate'}
                  {user?.role === 'Manager' && 'Sales Development Manager'}
                  {user?.role === 'Admin' && 'System Super Administrator'}
                </p>
              </div>
            </div>

            {/* Scope field */}
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <FiGrid className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data Scope Range</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                  {user?.role === 'BDA' ? 'Assigned Leads Scope' : 'Global Enterprise Scope'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Performance Metrics Summary */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
              Personal BDA Performance Scorecard
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time calculations based on active leads assigned under this profile.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="text-[10px] text-gray-500">Retrieving scorecard...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              
              {/* Stat 1 */}
              <div className="p-4 bg-gray-50 dark:bg-dark-950 border border-gray-200/40 dark:border-dark-800/40 rounded-xl flex items-center space-x-4">
                <div className="p-2.5 bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 rounded-xl">
                  <FiTrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Leads Managed</p>
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{stats?.totalLeads || 0}</h4>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-4 bg-gray-50 dark:bg-dark-950 border border-gray-200/40 dark:border-dark-800/40 rounded-xl flex items-center space-x-4">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <FiCheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deals Won (Closed)</p>
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{stats?.convertedLeads || 0}</h4>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-4 bg-gray-50 dark:bg-dark-950 border border-gray-200/40 dark:border-dark-800/40 rounded-xl flex items-center space-x-4">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl">
                  <FiClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Deals Open</p>
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{stats?.pendingLeads || 0}</h4>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="p-4 bg-gray-50 dark:bg-dark-950 border border-gray-200/40 dark:border-dark-800/40 rounded-xl flex items-center space-x-4">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-xl">
                  <FiDollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Value Won</p>
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{formatCurrency(stats?.totalRevenue || 0)}</h4>
                </div>
              </div>

            </div>
          )}

          <div className="p-4 bg-blue-50/50 dark:bg-primary-950/10 border border-blue-100/50 dark:border-primary-900/20 rounded-xl text-xs text-blue-800 dark:text-primary-300 leading-relaxed">
            💡 <span className="font-bold">Pro BDA Recommendation:</span> Always set concrete follow-up dates when creating leads. LeadFlow’s analytics automatically weight conversion charts based on pipeline activity signals.
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
