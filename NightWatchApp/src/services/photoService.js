import api, { axiosNoAuth } from './api';

export const photoService = {
  uploadPhoto: async (reportId, formData) => {
    const response = await api.post(`/photos/${reportId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePhoto: async (reportId, photoId) => {
    const response = await api.delete(`/photos/${reportId}/${photoId}`);
    return response.data;
  },

  getPhotosByReportId: async (reportId) => {
    const response = await api.get(`/photos/${reportId}`);
    return response.data;
  },

  getPhotoUrl: (photoPath) => {
    return `${api.defaults.baseURL}/uploads/${photoPath}`;
  },
};