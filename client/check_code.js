import { ethers } from 'ethers';

const ADDRESS = '0xaCde40f48548217AC381c824621Ff8A25e5d2714';
const PROVIDER_URL = 'https://rpc.sepolia.org'; 

async function main() {
    console.log(`Checking code at ${ADDRESS} on Sepolia...`);
    
    try {
        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const code = await provider.getCode(ADDRESS);
        
        if (code === '0x') {
            console.log("RESULT: NO CODE FOUND. Address is not a contract on this network.");
        } else {
            console.log(`RESULT: CODE FOUND. Length: ${code.length} chars.`);
            // Try to detect if it's the right contract by calling a likely safe view
            // e.g. querying a non-existent ID might revert if strict, but maybe try ID 1?
        }
    } catch (error) {
        console.error("RPC Error:", error.message);
    }
}

main();
