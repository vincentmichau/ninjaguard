import api from './api';

export const planningService = {
  getPlanning: async (filters = {}) => {
    const response = await api.get('/planning', { params: filters });
    return response.data;
  },

  createShift: async (shiftData) => {
    const response = await api.post('/planning', shiftData);
    return response.data;
  },

  updateShift: async (id, shiftData) => {
    const response = await api.put(`/planning/${id}`, shiftData);
    return response.data;
  },

  deleteShift: async (id) => {
    const response = await api.delete(`/planning/${id}`);
    return response.data;
  },

  exportICal: async (filters = {}) => {
    const response = await api.get('/planning/export/ical', { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  importFromRH: async (startDate, endDate) => {
    const response = await api.post('/planning/import/rh', {
      startDate,
      endDate,
    });
    return response.data;
  },
};