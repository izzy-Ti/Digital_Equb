import { ethers } from 'ethers';
import { EQUB_CONTRACT_ADDRESS, SUPPORTED_CHAIN_ID } from '../constants';

// Equb Contract ABI (simplified - update with your actual ABI)
const EQUB_ABI = [
  'function createEqub(string name, uint256 contributionAmount, uint256 cycleDuration, uint256 maxMembers) external returns (uint256)',
  'function joinEqub(uint256 equbId) external payable',
  'function contribute(uint256 equbId) external payable',
  'function selectWinner(uint256 equbId) external',
  'function getEqub(uint256 equbId) external view returns (tuple(uint256 id, address owner, string name, uint256 contributionAmount, uint256 cycleDuration, uint256 maxMembers, uint256 startTime, uint256 currentRound, bool isActive, uint256 totalPool))',
  'function getMembers(uint256 equbId) external view returns (address[])',
  'function getCurrentWinner(uint256 equbId) external view returns (address)',
  'event equbId(uint256 Id)',
  'event success(bool success)',
  'event EqubCreated(uint256 indexed equbId, address indexed owner, string name)', // Keep for backward compatibility if needed
  'event MemberJoined(uint256 indexed equbId, address indexed member)',
  'event ContributionMade(uint256 indexed equbId, address indexed member, uint256 amount)',
  'event WinnerSelected(uint256 indexed equbId, address indexed winner, uint256 round)',
];

// ... inside createEqub ...
      // Extract equb ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'equbId';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsedEvent = this.contract.interface.parseLog(event);
        return {
          txHash: receipt.hash,
          equbId: parsedEvent.args.Id.toString(),
        };
      }
      
      return { txHash: receipt.hash };

/**
 * Web3 Service
 * Handles all blockchain interactions
 */

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect wallet
   */
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.account = accounts[0];

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Check network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== SUPPORTED_CHAIN_ID) {
        await this.switchNetwork();
      }

      // Initialize contract
      this.contract = new ethers.Contract(
        EQUB_CONTRACT_ADDRESS,
        EQUB_ABI,
        this.signer
      );

      return this.account;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  /**
   * Switch to supported network
   */
  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}` }],
      });
    } catch (error) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}`,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Get current account
   */
  async getCurrentAccount() {
    if (!this.provider) {
      return null;
    }
    const accounts = await this.provider.listAccounts();
    return accounts[0]?.address || null;
  }

  /**
   * Get account balance
   */
  async getBalance(address) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Create equb on blockchain
   */
  async createEqub(name, contributionAmount, cycleDuration, maxMembers) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.createEqub(
        name,
        ethers.parseEther(contributionAmount.toString()),
        cycleDuration,
        maxMembers
      );
      const receipt = await tx.wait();
      
      // Extract equb ID from event
      const event = receipt.logs.find(log => {
        try {
          return this.contract.interface.parseLog(log)?.name === 'EqubCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsedEvent = this.contract.interface.parseLog(event);
        return {
          txHash: receipt.hash,
          equbId: parsedEvent.args.equbId.toString(),
        };
      }
      
      return { txHash: receipt.hash };
    } catch (error) {
      console.error('Error creating equb:', error);
      throw error;
    }
  }

  /**
   * Join equb on blockchain
   */
  async joinEqub(equbId, contributionAmount) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.joinEqub(equbId, {
        value: ethers.parseEther(contributionAmount.toString()),
      });
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error) {
      console.error('Error joining equb:', error);
      throw error;
    }
  }

  /**
   * Make contribution
   */
  async contribute(equbId, amount) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.contribute(equbId, {
        value: ethers.parseEther(amount.toString()),
      });
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error) {
      console.error('Error making contribution:', error);
      throw error;
    }
  }

  /**
   * Select winner
   */
  async selectWinner(equbId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.selectWinner(equbId);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error) {
      console.error('Error selecting winner:', error);
      throw error;
    }
  }

  /**
   * Get equb details from blockchain
   */
  async getEqubDetails(equbId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const equb = await this.contract.getEqub(equbId);
      return {
        id: equb.id.toString(),
        owner: equb.owner,
        name: equb.name,
        contributionAmount: ethers.formatEther(equb.contributionAmount),
        cycleDuration: equb.cycleDuration.toString(),
        maxMembers: equb.maxMembers.toString(),
        startTime: equb.startTime.toString(),
        currentRound: equb.currentRound.toString(),
        isActive: equb.isActive,
        totalPool: ethers.formatEther(equb.totalPool),
      };
    } catch (error) {
      console.error('Error getting equb details:', error);
      throw error;
    }
  }

  /**
   * Get equb members
   */
  async getEqubMembers(equbId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const members = await this.contract.getMembers(equbId);
      return members;
    } catch (error) {
      console.error('Error getting members:', error);
      throw error;
    }
  }

  /**
   * Listen to account changes
   */
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  /**
   * Listen to network changes
   */
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }
}

// Export singleton instance
export default new Web3Service();
