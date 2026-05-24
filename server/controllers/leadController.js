const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Get all leads with filters, search, sorting, and pagination
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res, next) => {
  try {
    const { search, status, priority, sortBy, sortOrder, page = 1, limit = 100 } = req.query;

    // Build query based on role
    // BDAs only see leads assigned to them or created by them
    // Managers and Admins see all leads
    let query = {};
    if (req.user.role === 'BDA') {
      query.$or = [
        { assignedTo: req.user._id },
        { createdBy: req.user._id }
      ];
    }

    // Apply Filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    // Apply Search (name or company)
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ]
      });
    }

    // Determine Sorting
    let sort = {};
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      sort[sortBy] = order;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    // Execute query with pagination
    const skipIndex = (page - 1) * limit;
    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skipIndex)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: leads.length,
      pagination: {
        total: totalLeads,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalLeads / limit),
      },
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.id || req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    // Authorization: BDAs can only view their own leads
    if (
      req.user.role === 'BDA' &&
      lead.assignedTo._id.toString() !== req.user._id.toString() &&
      lead.createdBy._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this lead');
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, priority, notes, estimatedValue, followUpDate, assignedTo } = req.body;

    // Create lead
    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      status: status || 'New',
      priority: priority || 'Medium',
      notes: notes || '',
      estimatedValue: estimatedValue || 0,
      followUpDate: followUpDate || null,
      assignedTo: assignedTo || req.user._id, // Default assign to self
      createdBy: req.user._id,
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    // Authorization: BDAs can only update their own leads
    if (
      req.user.role === 'BDA' &&
      lead.assignedTo.toString() !== req.user._id.toString() &&
      lead.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to update this lead');
    }

    // Update lead fields
    const fieldsToUpdate = {
      name: req.body.name !== undefined ? req.body.name : lead.name,
      company: req.body.company !== undefined ? req.body.company : lead.company,
      email: req.body.email !== undefined ? req.body.email : lead.email,
      phone: req.body.phone !== undefined ? req.body.phone : lead.phone,
      status: req.body.status !== undefined ? req.body.status : lead.status,
      priority: req.body.priority !== undefined ? req.body.priority : lead.priority,
      notes: req.body.notes !== undefined ? req.body.notes : lead.notes,
      estimatedValue: req.body.estimatedValue !== undefined ? req.body.estimatedValue : lead.estimatedValue,
      followUpDate: req.body.followUpDate !== undefined ? req.body.followUpDate : lead.followUpDate,
      assignedTo: req.body.assignedTo !== undefined ? req.body.assignedTo : lead.assignedTo,
    };

    lead = await Lead.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      res.status(404);
      throw new Error('Lead not found');
    }

    // Authorization: BDAs can only delete their own leads
    if (
      req.user.role === 'BDA' &&
      lead.assignedTo.toString() !== req.user._id.toString() &&
      lead.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to delete this lead');
    }

    await Lead.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Lead removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard aggregated statistics
// @route   GET /api/leads/stats
// @access  Private
const getLeadStats = async (req, res, next) => {
  try {
    // Scope query by role (same as getLeads)
    let query = {};
    if (req.user.role === 'BDA') {
      query.$or = [
        { assignedTo: req.user._id },
        { createdBy: req.user._id }
      ];
    }

    // 1. Core Summary Metrics
    const totalLeads = await Lead.countDocuments(query);
    const convertedLeads = await Lead.countDocuments({ ...query, status: 'Closed' });
    const pendingLeads = totalLeads - convertedLeads;

    // 2. Revenue calculation
    // Converted revenue is estimated value of closed leads
    const revenueResult = await Lead.aggregate([
      { $match: { ...query, status: 'Closed' } },
      { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 3. Monthly growth (leads created per month over past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month

    const growthResult = await Lead.aggregate([
      { 
        $match: { 
          ...query, 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          value: { $sum: '$estimatedValue' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly growth for Recharts
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyGrowth = [];
    
    // Fill in last 6 months even if empty
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-indexed for matching aggregation output
      
      const found = growthResult.find(g => g._id.year === year && g._id.month === month);
      monthlyGrowth.push({
        month: `${monthNames[month - 1]} ${year.toString().slice(-2)}`,
        leads: found ? found.count : 0,
        value: found ? found.value : 0,
      });
    }

    // 4. Pipeline/Status Breakdown
    const statusBreakdown = await Lead.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const pipelineData = ['New', 'Contacted', 'Interested', 'Proposal Sent', 'Closed'].map(status => {
      const found = statusBreakdown.find(s => s._id === status);
      return {
        name: status,
        value: found ? found.count : 0
      };
    });

    // 5. BDA Performance Summary
    const bdaPerformance = await Lead.aggregate([
      { $match: {} }, // Run globally so BDA can see how they rank vs colleagues (standard in BDA teams)
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
          },
          revenue: {
            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, '$estimatedValue', 0] }
          }
        }
      },
      { $sort: { converted: -1, revenue: -1 } },
      { $limit: 5 } // Top 5
    ]);

    // Populate BDA user names
    const populatedBdas = await Promise.all(
      bdaPerformance.map(async (perf) => {
        const user = await User.findById(perf._id).select('name email');
        return {
          name: user ? user.name : 'Unknown BDA',
          total: perf.total,
          converted: perf.converted,
          revenue: perf.revenue,
          conversionRate: perf.total > 0 ? Math.round((perf.converted / perf.total) * 100) : 0,
        };
      })
    );

    // 6. Recent activities (10 latest updated leads)
    const recentActivities = await Lead.find(query)
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        summary: {
          totalLeads,
          convertedLeads,
          pendingLeads,
          totalRevenue,
          conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
        },
        monthlyGrowth,
        pipeline: pipelineData,
        topPerformers: populatedBdas,
        recentActivities: recentActivities.map(lead => ({
          _id: lead._id,
          name: lead.name,
          company: lead.company,
          status: lead.status,
          updatedAt: lead.updatedAt,
          assignedTo: lead.assignedTo ? lead.assignedTo.name : 'Unassigned',
        })),
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
};
