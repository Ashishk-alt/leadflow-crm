import API from './api';

const getLeads = async (params = {}) => {
  const response = await API.get('/leads', { params });
  return response.data;
};

const getLeadById = async (id) => {
  const response = await API.get(`/leads/${id}`);
  return response.data;
};

const createLead = async (leadData) => {
  const response = await API.post('/leads', leadData);
  return response.data;
};

const updateLead = async (id, leadData) => {
  const response = await API.put(`/leads/${id}`, leadData);
  return response.data;
};

const deleteLead = async (id) => {
  const response = await API.delete(`/leads/${id}`);
  return response.data;
};

const getStats = async () => {
  const response = await API.get('/leads/stats');
  return response.data;
};

const getBDAs = async () => {
  const response = await API.get('/auth/bdas');
  return response.data;
};

const leadService = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getStats,
  getBDAs,
};

export default leadService;
