import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Games API
export const getGames = async () => {
  const response = await api.get('/api/games');
  return response.data;
};

export const getGame = async (id) => {
  const response = await api.get(`/api/games/${id}`);
  return response.data;
};

export const createGame = async (gameData) => {
  const response = await api.post('/api/games', gameData);
  return response.data;
};

export const deleteGame = async (id) => {
  const response = await api.delete(`/api/games/${id}`);
  return response.data;
};

// Flashes API
export const getFlashes = async (params = {}) => {
  const response = await api.get('/api/flashes', { params });
  return response.data;
};

export const getFlash = async (id) => {
  const response = await api.get(`/api/flashes/${id}`);
  return response.data;
};

export const createFlash = async (flashData) => {
  const response = await api.post('/api/flashes', flashData);
  return response.data;
};

export const updateFlash = async (id, flashData) => {
  const response = await api.put(`/api/flashes/${id}`, flashData);
  return response.data;
};

export const deleteFlash = async (id) => {
  const response = await api.delete(`/api/flashes/${id}`);
  return response.data;
};

// Analysis API
export const startAnalysis = async (gameId) => {
  const response = await api.post(`/api/analysis/start/${gameId}`);
  return response.data;
};

export const getAnalysisStatus = async (analysisId) => {
  const response = await api.get(`/api/analysis/status/${analysisId}`);
  return response.data;
};

export const getGameAnalyses = async (gameId) => {
  const response = await api.get(`/api/analysis/game/${gameId}`);
  return response.data;
};

export default api;