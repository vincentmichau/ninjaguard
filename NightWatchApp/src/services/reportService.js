import api from './api';

export const reportService = {
  getAllReports: async (filters = {}) => {
    const response = await api.get('/reports', { params: filters });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  updateReport: async (id, reportData) => {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  validateReport: async (id) => {
    const response = await api.post(`/reports/${id}/validate`);
    return response.data;
  },

  generatePDF: async (id) => {
    const response = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  sendEmail: async (id) => {
    const response = await api.post(`/reports/${id}/email`);
    return response.data;
  },
};