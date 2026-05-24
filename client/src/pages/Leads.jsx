import React, { useState, useEffect } from 'react';
import leadService from '../services/leadService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  FiSearch, FiFilter, FiPlus, FiDownload, FiEdit2, FiTrash2, 
  FiEye, FiX, FiCheck, FiUserPlus, FiCalendar, FiDollarSign 
} from 'react-icons/fi';

const Leads = () => {
  const { user } = useAuth();
  
  // Data States
  const [leads, setLeads] = useState([]);
  const [bdas, setBdas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  // Drawer / Form State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [selectedLead, setSelectedLead] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    priority: 'Medium',
    notes: '',
    estimatedValue: 0,
    followUpDate: '',
    assignedTo: '',
  });

  // Fetch BDAs for assignment lists
  const fetchBDAs = async () => {
    try {
      const res = await leadService.getBDAs();
      if (res.success) {
        setBdas(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Leads Database records
  const fetchLeads = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page,
        limit: 15,
      };
      const res = await leadService.getLeads(params);
      if (res.success) {
        setLeads(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leads records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBDAs();
  }, []);

  // Fetch when filters or page changes
  useEffect(() => {
    fetchLeads(pagination.page);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, page: 1 }); // reset page on filter change
  };

  // Open Drawer Configurations
  const openDrawer = (mode, lead = null) => {
    setDrawerMode(mode);
    setSelectedLead(lead);

    if (mode === 'add') {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        priority: 'Medium',
        notes: '',
        estimatedValue: 0,
        followUpDate: '',
        assignedTo: user?._id || '', // Default assign to current user BDA
      });
    } else if (lead) {
      setFormData({
        name: lead.name || '',
        company: lead.company || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'New',
        priority: lead.priority || 'Medium',
        notes: lead.notes || '',
        estimatedValue: lead.estimatedValue || 0,
        followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '',
        assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
      });
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedLead(null);
  };

  // Form Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name || !formData.company || !formData.email || !formData.phone) {
      return toast.error('Please fill in all contact requirements');
    }

    try {
      if (drawerMode === 'add') {
        const res = await leadService.createLead(formData);
        if (res.success) {
          toast.success('Lead created successfully!');
          fetchLeads();
          closeDrawer();
        }
      } else if (drawerMode === 'edit' && selectedLead) {
        const res = await leadService.updateLead(selectedLead._id, formData);
        if (res.success) {
          toast.success('Lead updated successfully!');
          fetchLeads();
          closeDrawer();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action failed. Check fields.');
    }
  };

  // Delete Handler
  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead? This cannot be undone.')) {
      try {
        const res = await leadService.deleteLead(id);
        if (res.success) {
          toast.success('Lead removed successfully');
          fetchLeads();
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to remove lead');
      }
    }
  };

  // CSV Export Utility
  const handleCSVExport = () => {
    if (leads.length === 0) {
      return toast.error('No leads available to export');
    }

    // Define CSV headers
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Priority', 'Estimated Value ($)', 'Follow-Up Date', 'BDA Assigned'];
    
    // Map leads rows
    const rows = leads.map(lead => [
      `"${lead.name}"`,
      `"${lead.company}"`,
      lead.email,
      `"${lead.phone}"`,
      lead.status,
      lead.priority,
      lead.estimatedValue || 0,
      lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : 'None',
      `"${lead.assignedTo?.name || 'Unassigned'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    // Trigger local download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LeadFlow_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Leads spreadsheet downloaded successfully!');
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      
      {/* 1. Header Toolbar Title & Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Leads Database</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Full control CRUD table of client leads, custom priority matrix, and pipeline assignments.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleCSVExport}
            className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 border border-gray-200 dark:border-dark-800 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
            title="Download CSV Spreadsheet"
          >
            <FiDownload className="h-4.5 w-4.5" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          <button 
            onClick={() => openDrawer('add')}
            className="inline-flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-md shadow-primary-500/10 cursor-pointer"
          >
            <FiPlus className="h-4.5 w-4.5" />
            <span>Add Business Lead</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Searches Section */}
      <div className="p-4 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FiSearch className="h-4 w-4" />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search leads by contact or company..."
            className="block w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-600 dark:text-gray-300"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-600 dark:text-gray-300"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="relative">
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-600 dark:text-gray-300"
          >
            <option value="createdAt">Date Created</option>
            <option value="estimatedValue">Deal Size Value</option>
            <option value="followUpDate">Follow-Up Date</option>
          </select>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Updating lead tables...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-2">
            <p className="text-base font-bold text-gray-500 dark:text-gray-400">No lead records found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Adjust filters or create a new lead to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-800 text-left text-xs font-medium">
              <thead className="bg-gray-50 dark:bg-dark-900/60 uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-dark-800">
                <tr>
                  <th className="px-6 py-4">Client Contact</th>
                  <th className="px-6 py-4">Industrial Company</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Deal Size ($)</th>
                  <th className="px-6 py-4">Follow-Up Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-800/60">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-950/20 transition-all duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{lead.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{lead.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-700 dark:text-gray-300 font-semibold">{lead.company}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{lead.phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide
                        ${lead.status === 'Closed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' : ''}
                        ${lead.status === 'New' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400' : ''}
                        ${lead.status === 'Contacted' ? 'bg-gray-100 dark:bg-dark-850 text-gray-800 dark:text-gray-300' : ''}
                        ${lead.status === 'Interested' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400' : ''}
                        ${lead.status === 'Proposal Sent' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400' : ''}
                      `}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                        ${lead.priority === 'High' ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20' : ''}
                        ${lead.priority === 'Medium' ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20' : ''}
                        ${lead.priority === 'Low' ? 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-dark-800' : ''}
                      `}>
                        <span className={`h-1.5 w-1.5 rounded-full 
                          ${lead.priority === 'High' ? 'bg-red-500' : ''}
                          ${lead.priority === 'Medium' ? 'bg-amber-500' : ''}
                          ${lead.priority === 'Low' ? 'bg-gray-400' : ''}
                        `}></span>
                        <span>{lead.priority}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700 dark:text-gray-300">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.estimatedValue || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">
                      {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                      <button 
                        onClick={() => openDrawer('view', lead)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-600 dark:text-gray-300 rounded-lg cursor-pointer"
                        title="View Details"
                      >
                        <FiEye className="h-4.5 w-4.5" />
                      </button>
                      <button 
                        onClick={() => openDrawer('edit', lead)}
                        className="p-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/30 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg cursor-pointer"
                        title="Edit Lead"
                      >
                        <FiEdit2 className="h-4.5 w-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(lead._id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg cursor-pointer"
                        title="Delete Lead"
                      >
                        <FiTrash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Sliding Side Drawer Component (Add / Edit / View Form) */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg bg-white dark:bg-dark-900 shadow-2xl border-l border-gray-200 dark:border-dark-850
        transform ${drawerOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-350 ease-in-out
        flex flex-col justify-between
      `}>
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-900/50">
          <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            {drawerMode === 'add' && 'Add New BDA Lead'}
            {drawerMode === 'edit' && 'Edit Business Lead'}
            {drawerMode === 'view' && 'Lead Profile details'}
          </h3>
          <button 
            onClick={closeDrawer}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 transition"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content Area */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Contact Name & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={drawerMode === 'view'}
                placeholder="e.g. Robert Stark"
                className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-70 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={drawerMode === 'view'}
                placeholder="e.g. Stark Industries"
                className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-70 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Contact Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={drawerMode === 'view'}
                placeholder="e.g. stark@mfg.com"
                className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-70 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Contact Phone *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={drawerMode === 'view'}
                placeholder="e.g. +1 (555) 123-4567"
                className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-70 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Status & Priority Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Status Stage
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={drawerMode === 'view'}
                className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-600 dark:text-gray-300"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={drawerMode === 'view'}
                className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-600 dark:text-gray-300"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Deal Value & Follow-Up Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Deal Size Value ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiDollarSign className="h-3.5 w-3.5" />
                </div>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                  disabled={drawerMode === 'view'}
                  placeholder="e.g. 85000"
                  className="block w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Follow-Up Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiCalendar className="h-3.5 w-3.5" />
                </div>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  disabled={drawerMode === 'view'}
                  className="block w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-600 dark:text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Assigned BDA */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Assigned BDA Owner
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiUserPlus className="h-3.5 w-3.5" />
              </div>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                disabled={drawerMode === 'view'}
                className="block w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-600 dark:text-gray-300"
              >
                <option value="">Select BDA</option>
                {bdas.map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes / Descriptions */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Sales Lead Notes
            </label>
            <textarea
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={drawerMode === 'view'}
              placeholder="e.g. Sent metallurgy catalogues. Client interested in ordering structural tubing in Q3..."
              className="block w-full px-3 py-2 bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>

          {/* Audit stamps (Only in View Mode) */}
          {drawerMode === 'view' && selectedLead && (
            <div className="pt-4 border-t border-gray-100 dark:border-dark-800 text-[10px] text-gray-400 dark:text-gray-500 font-medium space-y-1">
              <p>Created by: <span className="font-bold text-gray-500">{selectedLead.createdBy?.name || 'System Seeder'}</span></p>
              <p>Created on: <span>{new Date(selectedLead.createdAt).toLocaleString()}</span></p>
              <p>Last activity: <span>{new Date(selectedLead.updatedAt).toLocaleString()}</span></p>
            </div>
          )}
        </form>

        {/* Drawer Footer Actions */}
        <div className="h-16 flex items-center justify-end px-6 border-t border-gray-200 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-900/50 space-x-3">
          <button 
            onClick={closeDrawer}
            type="button"
            className="px-4 py-2 border border-gray-200 dark:border-dark-855 text-gray-600 dark:text-gray-300 font-semibold rounded-xl text-xs hover:bg-gray-100 dark:hover:bg-dark-800 transition cursor-pointer"
          >
            Cancel
          </button>
          
          {drawerMode !== 'view' && (
            <button 
              onClick={handleFormSubmit}
              type="submit"
              className="inline-flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow cursor-pointer"
            >
              <FiCheck className="h-4 w-4" />
              <span>{drawerMode === 'add' ? 'Create Lead' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Leads;
