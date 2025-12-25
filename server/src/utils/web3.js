import { ethers } from 'ethers';

// Contract ABI (you'll need to add the full ABI from your compiled contract)
const EQUB_ABI = [
    "function createEqub(string memory _name, uint256 _contributionAmount, uint256 _cycleDuration, uint256 _maxMember) public",
    "function startEqub(uint256 _equbId) public",
    "function endEqub(uint256 _equbId) public",
    "function pauseEqub(uint256 _equbId) public",
    "function joinEqub(uint256 _equbId) public",
    "function getMembers(uint256 _equbId) public view returns (address[] memory)",
    "function contribute(uint256 _equbId) public payable",
    "function getContributionStatus(uint256 _equbId) public view returns (tuple(uint256 joinedAt, bool hasPaidCurrentRound, bool hasWon))",
    "function getTotalPool(uint256 _equbId) public view returns (uint256)",
    "function selectWinner(uint256 _equbId, address _winnerAddress) public",
    "function getCurrentWinner(uint256 _equbId) public view returns (address)",
    "function getWinnersHistory(uint256 _equbId) public view returns (address[] memory)",
    "event EqubCreated(uint256 indexed equbId, address indexed owner, string name)",
    "event EqubStarted(uint256 indexed equbId)",
    "event MemberJoined(uint256 indexed equbId, address indexed member)",
    "event ContributionMade(uint256 indexed equbId, address indexed member, uint256 amount, uint256 round)",
    "event WinnerSelected(uint256 indexed equbId, address indexed winner, uint256 amount, uint256 round)"
];

// Initialize provider (you can use Infura, Alchemy, or local node)
export const getProvider = () => {
    const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
    return new ethers.JsonRpcProvider(rpcUrl);
};

// Get contract instance
export const getEqubContract = (contractAddress, signerOrProvider) => {
    return new ethers.Contract(contractAddress, EQUB_ABI, signerOrProvider);
};

// Get signer from private key (for backend operations)
export const getSigner = () => {
    const provider = getProvider();
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('Admin private key not configured');
    }
    return new ethers.Wallet(privateKey, provider);
};

// Helper function to convert Wei to Ether
export const weiToEther = (wei) => {
    return ethers.formatEther(wei);
};

// Helper function to convert Ether to Wei
export const etherToWei = (ether) => {
    return ethers.parseEther(ether.toString());
};

// Verify wallet signature (for wallet linking)
export const verifySignature = (message, signature, expectedAddress) => {
    try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
};

// Get transaction receipt
export const getTransactionReceipt = async (txHash) => {
    const provider = getProvider();
    return await provider.getTransactionReceipt(txHash);
};

// Wait for transaction confirmation
export const waitForTransaction = async (txHash, confirmations = 1) => {
    const provider = getProvider();
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
        throw new Error('Transaction not found');
    }
    return await tx.wait(confirmations);
};

// Get current block number
export const getCurrentBlock = async () => {
    const provider = getProvider();
    return await provider.getBlockNumber();
};

// Get gas price
export const getGasPrice = async () => {
    const provider = getProvider();
    const feeData = await provider.getFeeData();
    return feeData.gasPrice;
};

export default {
    getProvider,
    getEqubContract,
    getSigner,
    weiToEther,
    etherToWei,
    verifySignature,
    getTransactionReceipt,
    waitForTransaction,
    getCurrentBlock,
    getGasPrice
};
