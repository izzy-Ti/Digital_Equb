import api from '../config/api';

/**
 * Winner Service
 * Handles all winner-related API calls
 */

// Assign winner
export const assignWinner = async (equbId, userId, round) => {
  const response = await api.post('/winner/assign', {
    equbId,
    userId,
    round,
  });
  return response.data;
};

// Get winners for an equb
export const getEqubWinners = async (equbId) => {
  const response = await api.get(`/winner/equb/${equbId}`);
  return response.data;
};

// Get winner by round
export const getWinnerByRound = async (equbId, round) => {
  const response = await api.get(`/winner/round/${equbId}/${round}`);
  return response.data;
};

// Update payout status
export const updatePayoutStatus = async (winnerId, status, txHash) => {
  const response = await api.post('/winner/update-payout', {
    winnerId,
    status,
    txHash,
  });
  return response.data;
};
