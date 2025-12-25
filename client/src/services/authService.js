import api from '../config/api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// Register new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Logout user
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Google Login
export const googleLogin = async (credential) => {
  const response = await api.post('/auth/google-login', { credential });
  return response.data;
};

// Check if user is authenticated
export const isAuth = async () => {
  const response = await api.post('/auth/is-auth');
  return response.data;
};

// Send verification OTP
export const sendVerificationOTP = async () => {
  const response = await api.post('/auth/send-verification-otp');
  return response.data;
};

// Verify OTP
export const verifyOTP = async (otp) => {
  const response = await api.post('/auth/verify-otp', { otp });
  return response.data;
};

// Send password reset OTP
export const sendResetPasswordOTP = async (email) => {
  const response = await api.post('/auth/send-reset-password', { email });
  return response.data;
};

// Reset password
export const resetPassword = async (email, otp, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

// Get user data
export const getUserData = async () => {
  const response = await api.post('/auth/get-user-data');
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.post('/auth/updateProfile', profileData);
  return response.data;
};

// Link wallet address
export const linkWallet = async (walletAddress) => {
  const response = await api.post('/auth/link-wallet', { walletAddress });
  return response.data;
};

// Unlink wallet address
export const unlinkWallet = async () => {
  const response = await api.post('/auth/unlink-wallet');
  return response.data;
};
