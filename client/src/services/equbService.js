import api from '../config/api';

/**
 * Equb Service
 * Handles all equb-related API calls
 */

// Create new equb
export const createEqub = async (equbData) => {
  const response = await api.post('/equb/create', equbData);
  return response.data;
};

// Start equb
export const startEqub = async (equbId) => {
  const response = await api.post('/equb/start', { equbId });
  return response.data;
};

// Pause equb
export const pauseEqub = async (equbId) => {
  const response = await api.post('/equb/pause', { equbId });
  return response.data;
};

// End equb
export const endEqub = async (equbId) => {
  const response = await api.post('/equb/end', { equbId });
  return response.data;
};

// Get all equbs
export const getAllEqubs = async () => {
  const response = await api.get('/equb/all');
  return response.data;
};

// Get equb by ID
export const getEqubById = async (equbId) => {
  const response = await api.get(`/equb/${equbId}`);
  return response.data;
};

// Get equbs by creator
export const getEqubsByCreator = async (userId) => {
  const response = await api.get(`/equb/creator/${userId}`);
  return response.data;
};

// Get equb statistics
export const getEqubStats = async (equbId) => {
  const response = await api.get(`/equb/${equbId}/stats`);
  return response.data;
};

// Sync equb from blockchain
export const syncEqubFromBlockchain = async (equbId, blockchainData) => {
  const response = await api.post('/equb/sync', { equbId, ...blockchainData });
  return response.data;
};
