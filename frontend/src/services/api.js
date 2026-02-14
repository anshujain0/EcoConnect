import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/analysis/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getAnalysis = async (analysisId) => {
  const response = await api.get(`/analysis/${analysisId}`);
  return response.data;
};

export const submitAnswers = async (analysisId, answers) => {
  const response = await api.post(`/analysis/${analysisId}/answers`, { answers });
  return response.data;
};

export const getNearbyLocations = async (analysisId, latitude, longitude) => {
  const response = await api.post(`/analysis/${analysisId}/locations`, {
    latitude,
    longitude,
  });
  return response.data;
};

export default api;