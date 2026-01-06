import api from '../config/api';

/**
 * Member Service
 * Handles all member-related API calls
 */

// Join equb
export const joinEqub = async (userId, equbId, walletAddress) => {
  const response = await api.post('/member/join', { userId, equbId, walletAddress });
  return response.data;
};

// Leave equb
export const leaveEqub = async (equbId) => {
  const response = await api.post('/member/leave', { equbId });
  return response.data;
};

// Get equb members
export const getEqubMembers = async (equbId) => {
  const response = await api.get(`/member/equb/${equbId}`);
  return response.data;
};

// Get user's equbs
export const getUserEqubs = async (userId) => {
  const response = await api.get(`/member/user/${userId}`);
  return response.data;
};

// Check membership
export const checkMembership = async (equbId, userId) => {
  const response = await api.get(`/member/check/${equbId}/${userId}`);
  return response.data;
};
