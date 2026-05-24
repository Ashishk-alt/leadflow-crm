import React, { useState, useEffect } from 'react';
import leadService from '../services/leadService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  FiTrendingUp, FiCheckCircle, FiClock, FiDollarSign, FiPercent, 
  FiAward, FiActivity, FiRefreshCw, FiExternalLink 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await leadService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading BDA Workspace metrics...</p>
        </div>
      </div>
    );
  }

  const { summary, monthlyGrowth, pipeline, topPerformers, recentActivities } = stats || {};

  // Formatter for Currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Harmonious Color Palette for Pie Chart Slices
  const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#f59e0b', '#10b981'];

  // Stats Card data config
  const statCards = [
    {
      title: 'Total BDA Leads',
      value: summary?.totalLeads || 0,
      icon: FiTrendingUp,
      colorClass: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/30',
      description: 'Leads tracked in funnel'
    },
    {
      title: 'Converted Deals',
      value: summary?.convertedLeads || 0,
      icon: FiCheckCircle,
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
      description: 'Status closed won'
    },
    {
      title: 'Active Pipeline',
      value: summary?.pendingLeads || 0,
      icon: FiClock,
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30',
      description: 'Nurturing statuses'
    },
    {
      title: 'Closed Revenue',
      value: formatCurrency(summary?.totalRevenue || 0),
      icon: FiDollarSign,
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30',
      description: 'Deal sizes sum'
    },
    {
      title: 'Conversion Rate',
      value: `${summary?.conversionRate || 0}%`,
      icon: FiPercent,
      colorClass: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30',
      description: 'Efficiency score'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Hello, {user?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here is your sales performance snapshot and BDA team pipeline status.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 border border-gray-200 dark:border-dark-800 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
        >
          <FiRefreshCw className="h-4 w-4" />
          <span>Refresh Workspace</span>
        </button>
      </div>

      {/* Grid of Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border bg-white dark:bg-dark-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${card.colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {card.value}
                </h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mt-1">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Lead Growth AreaChart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Month-over-Month Sales Growth
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tracking lead additions and projected pipeline value over the past 6 months
            </p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d2d2d" className="hidden dark:block" />
                <XAxis dataKey="month" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="leads" name="Leads Logged" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution PieChart */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Pipeline Funnel Share
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Leads split across stages of the BDA pipeline
            </p>
          </div>
          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipeline}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pipeline?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend Custom */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {pipeline?.map((entry, idx) => (
              <div key={entry.name} className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Leaderboard and Activities row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Performers Leaderboard */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiAward className="h-5 w-5 text-indigo-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                BDA Performance Leaderboard
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Top Conversions
            </span>
          </div>

          <div className="space-y-4">
            {topPerformers?.map((bda, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-dark-950 border border-gray-200/40 dark:border-dark-800/40 hover:scale-[1.005] transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{bda.name}</h4>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      Conversion Rate: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{bda.conversionRate}%</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {bda.converted} / {bda.total} Deals Won
                  </span>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(bda.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities Feed */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiActivity className="h-5 w-5 text-sky-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Recent Lead Workspace Events
              </h3>
            </div>
            <Link to="/leads" className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center space-x-1 hover:underline">
              <span>View Database</span>
              <FiExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivities?.map((act, idx) => (
              <div 
                key={idx} 
                className="flex items-start justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-dark-950 border border-gray-200/40 dark:border-dark-800/40"
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-500 flex-shrink-0 animate-soft-pulse"></span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {act.name} <span className="font-normal text-gray-500">at</span> {act.company}
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Assigned to: <span className="font-semibold text-gray-600 dark:text-gray-400">{act.assignedTo}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide
                    ${act.status === 'Closed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/30' : ''}
                    ${act.status === 'New' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border border-blue-200/30' : ''}
                    ${act.status !== 'Closed' && act.status !== 'New' ? 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300' : ''}
                  `}>
                    {act.status}
                  </span>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(act.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
