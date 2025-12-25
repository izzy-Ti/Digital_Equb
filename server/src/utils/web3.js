import { ethers } from 'ethers';

// Contract address (deployed) and full ABI
const CONTRACT_ADDRESS = '0xd860F7eA20485655975b4b6dBD38C0d50ef6ee44';

const EQUB_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "activeEqubCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "contribute",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "count",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_contributionAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_cycleDuration",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_maxMember",
                "type": "uint256"
            }
        ],
        "name": "createEqub",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "endEqub",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "equbs",
        "outputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "contributionAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cycleDuration",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxMembers",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "startTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentRound",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "totalPool",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "getContributionStatus",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "joinedAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "hasPaidCurrentRound",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "hasWon",
                        "type": "bool"
                    }
                ],
                "internalType": "struct Equb.member",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "getCurrentWinner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "getMembers",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "getTotalPool",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "getWinnersHistory",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "joinEqub",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "pauseEqub",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_winnerAddress",
                "type": "address"
            }
        ],
        "name": "selectWinner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_equbId",
                "type": "uint256"
            }
        ],
        "name": "startEqub",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Initialize provider (you can use Infura, Alchemy, or local node)
export const getProvider = () => {
    const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
    return new ethers.JsonRpcProvider(rpcUrl);
};

// Get contract instance
export const getEqubContract = (contractAddress = CONTRACT_ADDRESS, signerOrProvider) => {
    const providerOrSigner = signerOrProvider || getProvider();
    return new ethers.Contract(contractAddress, EQUB_ABI, providerOrSigner);
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

// Default contract instance (uses RPC provider). Use `getEqubContract(CONTRACT_ADDRESS, signer)` for signer operations.
export const EqubContract = getEqubContract(CONTRACT_ADDRESS, getProvider());
