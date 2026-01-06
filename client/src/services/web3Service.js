import { ethers } from 'ethers';
import { EQUB_CONTRACT_ADDRESS, SUPPORTED_CHAIN_ID } from '../constants';

// Equb Contract ABI (simplified - update with your actual ABI)
const EQUB_ABI = [
  'function createEqub(string name, uint256 contributionAmount, uint256 cycleDuration, uint256 maxMembers) external returns (uint256)',
  'function joinEqub(uint256 equbId) external payable',
  'function startEqub(uint256 equbId) external',
  'function contribute(uint256 equbId) external payable',
  'function selectWinner(uint256 equbId, address winnerAddress) external',
  'function equbs(uint256) view returns (address owner, string name, uint256 contributionAmount, uint256 cycleDuration, uint256 maxMembers, uint256 startTime, uint256 currentRound, bool isActive, address[] members, address[] winners, uint256 totalPool)', 
  // NOTE: The default getter for struct with arrays might NOT return the arrays. 
  // Based on standard Solidity getter generation for mapping(uint => Struct):
  // It returns (owner, name, contributionAmount, cycleDuration, maxMembers, startTime, currentRound, isActive, totalPool) 
  // It SKIPS dynamic arrays (members, winners) and mappings inside the struct.
  // We need to use 'function equbs(uint256) view returns (address owner, string name, uint256 contributionAmount, uint256 cycleDuration, uint256 maxMembers, uint256 startTime, uint256 currentRound, bool isActive, uint256 totalPool)'
  'function getMembers(uint256 equbId) external view returns (address[])',
  'function getCurrentWinner(uint256 equbId) external view returns (address)',
  'event equbId(uint256 Id)',
  'event success(bool success)',
  'event EqubCreated(uint256 indexed equbId, address indexed owner, string name)', // Keep for backward compatibility if needed
  'event MemberJoined(uint256 indexed equbId, address indexed member)',
  'event ContributionMade(uint256 indexed equbId, address indexed member, uint256 amount)',
  'event WinnerSelected(uint256 indexed equbId, address indexed winner, uint256 round)',
];



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
  /**
   * Initialize Web3 Service
   * Sets up provider and contract if wallet is connected
   */
  async initialize() {
    if (!this.isMetaMaskInstalled()) return null;

    this.provider = new ethers.BrowserProvider(window.ethereum);
    
    try {
      const accounts = await this.provider.listAccounts();
      if (accounts.length > 0) {
         this.signer = await this.provider.getSigner();
         this.account = accounts[0].address;
         
         // Check network
         const network = await this.provider.getNetwork();
         if (Number(network.chainId) !== SUPPORTED_CHAIN_ID) {
            // We don't force switch on init to avoid popup spam, but we can't write
            // Maybe just warn? For now, we assume user will switch if they try to interact
         }
         
         // Initialize contract
         this.contract = new ethers.Contract(
            EQUB_CONTRACT_ADDRESS,
            EQUB_ABI,
            this.signer
         );
         
         return this.account;
      }
    } catch (err) {
      console.error("Auto-initialization failed", err);
    }
    return null;
  }

  /**
   * Connect wallet
   */
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Initialize provider if not already done
      if (!this.provider) {
          this.provider = new ethers.BrowserProvider(window.ethereum);
      }

      // Request account access
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Re-run full initialization to setup signer/contract
      return await this.initialize(); 

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
    } catch (error) {
      console.error('Error creating equb:', error);
      throw error;
    }
  }

  /**
   * Start equb on blockchain (Owner only)
   */
  async startEqub(equbId) {
    if (!this.contract) {
        await this.initialize();
    }
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const tx = await this.contract.startEqub(equbId);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error) {
      console.error('Error starting equb:', error);
      throw error;
    }
  }

  /**
   * Join equb on blockchain
   */
  async joinEqub(equbId, contributionAmount) {
    // Lazy init: If contract is missing but we have ethereum, try to restore
    if (!this.contract && this.isMetaMaskInstalled()) {
        await this.initialize();
    }

    if (!this.contract) {
      throw new Error('Contract not initialized. Please refresh the page or reconnect your wallet.');
    }

    try {
      const currentAddress = await this.getCurrentAccount();
      if (!currentAddress) throw new Error("Wallet not connected");

      // 1. Manual Validation: Check if already a member
      let members;
      try {
          members = await this.contract.getMembers(equbId);
      } catch (err) {
          console.error("Validation Error (getMembers):", err);
          throw new Error("Failed to verify membership. The contract may be inaccessible or the Equb ID is invalid.");
      }

      const isMember = members.some(m => m.toLowerCase() === currentAddress.toLowerCase());
      if (isMember) {
          throw new Error("You have already joined this Equb.");
      }

      // 2. Manual Validation: Check if full
      let equbDetails;
      try {
           // Use the mapping getter 'equbs' which returns the struct fields (excluding arrays/mappings)
           // Returns: [owner, name, contributionAmount, cycleDuration, maxMembers, startTime, currentRound, isActive, totalPool]
           equbDetails = await this.contract.equbs(equbId);
      } catch (err) {
           console.error("Validation Error (equbs mapping):", err);
           throw new Error("Failed to fetch Equb details. Please check your network connection.");
      }

      const maxMembers = equbDetails.maxMembers; 
      
      if (members.length >= Number(maxMembers)) {
          throw new Error("This Equb is full.");
      }

      // 3. Check contribution amount (optional but good)
      const expectedAmount = equbDetails.contributionAmount;
      const parsedContribution = ethers.parseEther(contributionAmount.toString());
      if (parsedContribution !== expectedAmount) {
          throw new Error(`Incorrect contribution amount. Expected ${ethers.formatEther(expectedAmount)} ETH.`);
      }

      // If checks pass, simulate and send
      const value = parsedContribution;
      
      // Simulate transaction first to check for reverts (double check)
      try {
          await this.contract.joinEqub.staticCall(equbId, { value });
      } catch (simulationError) {
          console.error("Simulation failed:", simulationError);
          
          // Try to decode revert reason
          if (simulationError.data) {
              try {
                  const reason = this.contract.interface.parseError(simulationError.data);
                  if (reason) throw new Error(`Contract Error: ${reason.name}`);
              } catch (e) {}
          }

          if (simulationError.reason) {
              throw new Error(`Transaction Reverted: ${simulationError.reason}`);
          }
          
          if (simulationError.message.includes("method not found") || simulationError.message.includes("payable")) {
              throw new Error("The contract's joinEqub function is not accepting payments. Please ensure the contract is updated and payable.");
          }

          throw new Error("Transaction likely to fail. The Equb might not be active, you might already be a member, or the join limit was reached.");
      }

      const tx = await this.contract.joinEqub(equbId, {
        value: value,
      });
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error) {
      console.error('Error joining equb:', error);
      if (error.code === 'INSUFFICIENT_FUNDS' || error.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds. You do not have enough ETH to cover the contribution + gas.');
      }
      // Re-throw the clean error we created above, or the original if it wasn't caught yet
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
  async selectWinner(equbId, winnerAddress) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.selectWinner(equbId, winnerAddress);
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
      // Use the mapping getter
      // Result: [owner, name, contributionAmount, cycleDuration, maxMembers, startTime, currentRound, isActive, totalPool]
      // Ethers returns a Result object that allows access by position and name (if provided in ABI)
      // Since we used a simplified string ABI above for 'equbs', we can rely on property access if we name them in the ABI string in the replacement above.
      
      // Let's ensure the ABI replacement above INCLUDES the names. 
      // 'function equbs(uint256) view returns (address owner, string name, uint256 contributionAmount, uint256 cycleDuration, uint256 maxMembers, uint256 startTime, uint256 currentRound, bool isActive, uint256 totalPool)'
      
      const equb = await this.contract.equbs(equbId);
      
      return {
        id: equbId.toString(), // ID is the key, not in the value
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
