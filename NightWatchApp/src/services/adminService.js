import api from './api';

export const adminService = {
  // Users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Sites
  getAllSites: async () => {
    const response = await api.get('/admin/sites');
    return response.data;
  },

  createSite: async (siteData) => {
    const response = await api.post('/admin/sites', siteData);
    return response.data;
  },

  updateSite: async (id, siteData) => {
    const response = await api.put(`/admin/sites/${id}`, siteData);
    return response.data;
  },

  deleteSite: async (id) => {
    const response = await api.delete(`/admin/sites/${id}`);
    return response.data;
  },

  // Clients
  getAllClients: async () => {
    const response = await api.get('/admin/clients');
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await api.post('/admin/clients', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await api.put(`/admin/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await api.delete(`/admin/clients/${id}`);
    return response.data;
  },

  // Email Recipients
  getAllEmailRecipients: async () => {
    const response = await api.get('/admin/email-recipients');
    return response.data;
  },

  createEmailRecipient: async (recipientData) => {
    const response = await api.post('/admin/email-recipients', recipientData);
    return response.data;
  },

  deleteEmailRecipient: async (id) => {
    const response = await api.delete(`/admin/email-recipients/${id}`);
    return response.data;
  },

  // Statistics
  getStatistics: async (filters = {}) => {
    const response = await api.get('/admin/statistics', { params: filters });
    return response.data;
  },
};