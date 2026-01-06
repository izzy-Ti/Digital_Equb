// API Base URL - update this to match your backend
export const API_BASE_URL = 'http://localhost:4000/api';

// Smart Contract Addresses (update with deployed contract addresses)
export const EQUB_CONTRACT_ADDRESS = '0xacde40f48548217ac381c824621ff8a25e5d2714'; // REPLACE WITH DEPLOYED ADDRESS

// Blockchain Network Configuration
export const SUPPORTED_CHAIN_ID = 11155111; // Sepolia testnet
export const SUPPORTED_CHAIN_NAME = 'Sepolia';

// Application Constants
export const APP_NAME = 'Digital Equb';
export const APP_DESCRIPTION = 'Decentralized savings groups powered by blockchain';

// Equb Status
export const EQUB_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Contribution Status
export const CONTRIBUTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
};

// Payout Status
export const PAYOUT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
