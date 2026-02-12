import api from './api';

export const eventService = {
  getEventsByReportId: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/events`);
    return response.data;
  },

  createEvent: async (reportId, eventData) => {
    const response = await api.post(`/reports/${reportId}/events`, eventData);
    return response.data;
  },

  updateEvent: async (reportId, eventId, eventData) => {
    const response = await api.put(`/reports/${reportId}/events/${eventId}`, eventData);
    return response.data;
  },

  deleteEvent: async (reportId, eventId) => {
    const response = await api.delete(`/reports/${reportId}/events/${eventId}`);
    return response.data;
  },
};