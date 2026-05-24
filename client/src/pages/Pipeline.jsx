import React, { useState, useEffect } from 'react';
import leadService from '../services/leadService';
import { toast } from 'react-hot-toast';
import { 
  FiRefreshCw, FiPlus, FiArrowRight, FiArrowLeft, 
  FiDollarSign, FiClock, FiAlertCircle 
} from 'react-icons/fi';

const Pipeline = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // 5 Funnel stages mapping
  const COLUMNS = ['New', 'Contacted', 'Interested', 'Proposal Sent', 'Closed'];
  
  const COLUMN_COLORS = {
    'New': 'border-t-blue-500 bg-blue-500/5',
    'Contacted': 'border-t-gray-400 bg-gray-400/5',
    'Interested': 'border-t-purple-500 bg-purple-500/5',
    'Proposal Sent': 'border-t-amber-500 bg-amber-500/5',
    'Closed': 'border-t-emerald-500 bg-emerald-500/5',
  };

  const DOT_COLORS = {
    'New': 'bg-blue-500',
    'Contacted': 'bg-gray-400',
    'Interested': 'bg-purple-500',
    'Proposal Sent': 'bg-amber-500',
    'Closed': 'bg-emerald-500',
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await leadService.getLeads({ limit: 100 });
      if (res.success) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sales pipeline leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Native HTML5 Drag and Drop functions
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping!
  };

  const handleDrop = async (e, targetStatus) => {
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    const leadToUpdate = leads.find(l => l._id === leadId);
    if (!leadToUpdate || leadToUpdate.status === targetStatus) return;

    // Optimistic UI Update
    const updatedLeads = leads.map(l => 
      l._id === leadId ? { ...l, status: targetStatus } : l
    );
    setLeads(updatedLeads);

    try {
      const res = await leadService.updateLead(leadId, { status: targetStatus });
      if (res.success) {
        toast.success(`Moved ${res.data.name} to ${targetStatus}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update lead status');
      // Rollback on failure
      fetchLeads();
    }
  };

  // Mobile manual shift controls
  const handleMoveStatus = async (lead, direction) => {
    const currentIndex = COLUMNS.indexOf(lead.status);
    let targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= COLUMNS.length) return;
    const targetStatus = COLUMNS[targetIndex];

    try {
      const res = await leadService.updateLead(lead._id, { status: targetStatus });
      if (res.success) {
        toast.success(`Moved ${lead.name} to ${targetStatus}`);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to shift lead status');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Lead Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Interactive Kanban board. Drag and drop cards to change lead phases automatically.
          </p>
        </div>
        <button 
          onClick={fetchLeads}
          className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 border border-gray-200 dark:border-dark-800 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
        >
          <FiRefreshCw className="h-4 w-4" />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading Kanban pipeline...</p>
          </div>
        </div>
      ) : (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4 select-none">
          {COLUMNS.map((column) => {
            const columnLeads = leads.filter(l => l.status === column);
            const totalValue = columnLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

            return (
              <div 
                key={column} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
                className={`flex flex-col p-4 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-2xl border-t-4 ${COLUMN_COLORS[column]} min-h-[65vh] w-full shadow-sm`}
              >
                {/* Column Title Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[column]}`}></span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {column}
                    </span>
                  </div>
                  <span className="inline-block bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Projected Value Header */}
                <div className="mb-4 pb-2 border-b border-gray-100 dark:border-dark-800/40 text-[10px] text-gray-400 dark:text-gray-500 font-semibold flex items-center justify-between">
                  <span>EST. VALUE:</span>
                  <span className="text-gray-700 dark:text-gray-300 font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}
                  </span>
                </div>

                {/* Column Cards Wrapper */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[55vh] pr-1">
                  {columnLeads.map((lead) => {
                    const isHighPriority = lead.priority === 'High';
                    const hasFollowUpToday = lead.followUpDate && 
                      new Date(lead.followUpDate).toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={lead._id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, lead._id)}
                        className={`p-3.5 bg-white dark:bg-dark-950 border border-gray-200/80 dark:border-dark-800 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-primary-300/70 dark:hover:border-primary-800/70 transition duration-200 relative group`}
                      >
                        {/* High priority indicator */}
                        {isHighPriority && (
                          <span className="absolute top-0 right-3 transform -translate-y-1/2 bg-red-500 text-white font-extrabold uppercase text-[7px] px-1.5 py-0.2 rounded-full tracking-wider border border-white dark:border-dark-900">
                            High
                          </span>
                        )}

                        {/* Company & Client contact */}
                        <div className="mb-3">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {lead.company}
                          </h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            Attn: {lead.name}
                          </p>
                        </div>

                        {/* Deal Estimated size */}
                        <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 font-semibold mb-3">
                          <div className="flex items-center space-x-1">
                            <FiDollarSign className="h-3 w-3 text-emerald-500" />
                            <span className="text-gray-700 dark:text-gray-300 font-bold">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.estimatedValue || 0)}
                            </span>
                          </div>
                          
                          {/* Follow-up Indicator alert */}
                          {lead.followUpDate && (
                            <div className={`flex items-center space-x-1 ${hasFollowUpToday ? 'text-amber-500' : 'text-gray-400'}`}>
                              <FiClock className="h-3 w-3" />
                              <span>{new Date(lead.followUpDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions (Transition shift buttons) */}
                        <div className="pt-2.5 border-t border-gray-100 dark:border-dark-800/40 flex justify-between items-center gap-2">
                          <span className="text-[9px] font-bold bg-gray-50 dark:bg-dark-900 text-gray-500 dark:text-gray-400 px-1.5 py-0.2 rounded uppercase truncate max-w-[80px]">
                            {lead.assignedTo?.name || 'Unassigned'}
                          </span>

                          <div className="flex items-center space-x-1">
                            {/* Left Transition Trigger */}
                            {column !== 'New' && (
                              <button 
                                onClick={() => handleMoveStatus(lead, -1)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition cursor-pointer"
                                title="Move Stage Left"
                              >
                                <FiArrowLeft className="h-3 w-3" />
                              </button>
                            )}

                            {/* Right Transition Trigger */}
                            {column !== 'Closed' && (
                              <button 
                                onClick={() => handleMoveStatus(lead, 1)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition cursor-pointer"
                                title="Move Stage Right"
                              >
                                <FiArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                  {columnLeads.length === 0 && (
                    <div className="py-12 text-center text-[10px] text-gray-400 border border-dashed border-gray-200 dark:border-dark-800 rounded-xl">
                      Empty stage
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Pipeline;
// Safe default
