import { ethers } from 'ethers';

const ABI = [
  'function getEqub(uint256 equbId) external view returns (tuple(uint256 id, address owner, string name, uint256 contributionAmount, uint256 cycleDuration, uint256 maxMembers, uint256 startTime, uint256 currentRound, bool isActive, uint256 totalPool))',
  'function getMembers(uint256 equbId) external view returns (address[])'
];

const ADDRESS = '0xaCde40f48548217AC381c824621Ff8A25e5d2714';
const ID = 5;

// RPC for Sepolia (public)
const PROVIDER_URL = 'https://rpc.sepolia.org'; 

async function main() {
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const contract = new ethers.Contract(ADDRESS, ABI, provider);

    console.log(`Checking Equb ID ${ID} on contract ${ADDRESS}...`);

    try {
        const members = await contract.getMembers(ID);
        console.log("getMembers result:", members);
    } catch (e) {
        console.log("getMembers failed:", e.code || e.message);
    }

    try {
        const equb = await contract.getEqub(ID);
        console.log("getEqub result:", equb);
    } catch (e) {
        // Ethers v6 usually throws generic errors for calls that revert
        console.log("getEqub failed (likely doesn't exist):", e.shortMessage || e.message);
    }
}

main().catch(console.error);
