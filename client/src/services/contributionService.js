import api from '../config/api';

/**
 * Contribution Service
 * Handles all contribution-related API calls
 */

// Record contribution
export const recordContribution = async (contributionData) => {
  const response = await api.post('/contribution/record', contributionData);
  return response.data;
};

// Update contribution status
export const updateContributionStatus = async (contributionId, status, txHash) => {
  const response = await api.post('/contribution/update-status', {
    contributionId,
    status,
    txHash,
  });
  return response.data;
};

// Get user contributions
export const getUserContributions = async (userId) => {
  const response = await api.get(`/contribution/user/${userId}`);
  return response.data;
};

// Get equb contributions
export const getEqubContributions = async (equbId) => {
  const response = await api.get(`/contribution/equb/${equbId}`);
  return response.data;
};

// Get contribution by transaction hash
export const getContributionByTxHash = async (txHash) => {
  const response = await api.get(`/contribution/tx/${txHash}`);
  return response.data;
};

// Get round statistics
export const getRoundStats = async (equbId, round) => {
  const response = await api.get(`/contribution/round/${equbId}/${round}`);
  return response.data;
};
