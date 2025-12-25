import { getProvider, getEqubContract } from './web3.js';
import { Contribution } from '../models/contribution.js';
import { Winner } from '../models/winner.js';
import Equb from '../models/equb.js';
import { user } from '../models/user.js';

// Listen to blockchain events and update database
export const startEventListeners = (contractAddress) => {
    const provider = getProvider();
    const contract = getEqubContract(contractAddress, provider);

    console.log('Starting blockchain event listeners...');

    // Listen for EqubCreated events
    contract.on('EqubCreated', async (equbId, owner, name, event) => {
        console.log(`EqubCreated: ID=${equbId}, Owner=${owner}, Name=${name}`);
        // Event is already handled by frontend, but you can add additional logic here
    });

    // Listen for EqubStarted events
    contract.on('EqubStarted', async (equbId, event) => {
        console.log(`EqubStarted: ID=${equbId}`);
        try {
            const equb = await Equb.findOne({ blockchainEqubId: equbId.toString() });
            if (equb && equb.status !== 'active') {
                equb.status = 'active';
                equb.startTime = new Date();
                await equb.save();
                console.log(`Updated equb ${equbId} status to active`);
            }
        } catch (error) {
            console.error('Error handling EqubStarted event:', error);
        }
    });

    // Listen for MemberJoined events
    contract.on('MemberJoined', async (equbId, member, event) => {
        console.log(`MemberJoined: EqubID=${equbId}, Member=${member}`);
        // Membership is handled by frontend, but you can add verification here
    });

    // Listen for ContributionMade events
    contract.on('ContributionMade', async (equbId, member, amount, round, event) => {
        console.log(`ContributionMade: EqubID=${equbId}, Member=${member}, Amount=${amount}, Round=${round}`);
        
        try {
            const txHash = event.log.transactionHash;
            const blockNumber = event.log.blockNumber;

            // Find or update contribution
            let contribution = await Contribution.findOne({ txHash });
            
            if (contribution) {
                contribution.status = 'confirmed';
                contribution.blockNumber = blockNumber;
                await contribution.save();
                console.log(`Updated contribution status to confirmed: ${txHash}`);
            } else {
                // Find user by wallet address
                const User = await user.findOne({ 
                    walletAddress: member.toLowerCase() 
                });

                if (User) {
                    // Find equb
                    const equb = await Equb.findOne({ 
                        blockchainEqubId: equbId.toString() 
                    });

                    if (equb) {
                        contribution = new Contribution({
                            equbId: equb._id,
                            userId: User._id,
                            amount: amount.toString(),
                            round: round.toString(),
                            txHash,
                            blockNumber,
                            status: 'confirmed'
                        });
                        await contribution.save();
                        console.log(`Created new contribution record: ${txHash}`);

                        // Update equb total pool
                        equb.totalPool = (BigInt(equb.totalPool) + BigInt(amount.toString())).toString();
                        await equb.save();
                    }
                }
            }
        } catch (error) {
            console.error('Error handling ContributionMade event:', error);
        }
    });

    // Listen for WinnerSelected events
    contract.on('WinnerSelected', async (equbId, winner, amount, round, event) => {
        console.log(`WinnerSelected: EqubID=${equbId}, Winner=${winner}, Amount=${amount}, Round=${round}`);
        
        try {
            const txHash = event.log.transactionHash;
            const blockNumber = event.log.blockNumber;

            // Find user by wallet address
            const User = await user.findOne({ 
                walletAddress: winner.toLowerCase() 
            });

            if (User) {
                // Find equb
                const equb = await Equb.findOne({ 
                    blockchainEqubId: equbId.toString() 
                });

                if (equb) {
                    // Check if winner already recorded
                    const existingWinner = await Winner.findOne({ 
                        equbId: equb._id, 
                        round: round.toString() 
                    });

                    if (!existingWinner) {
                        const winnerRecord = new Winner({
                            equbId: equb._id,
                            userId: User._id,
                            walletAddress: winner.toLowerCase(),
                            round: round.toString(),
                            payoutAmount: amount.toString(),
                            payoutTxHash: txHash,
                            blockNumber,
                            payoutStatus: 'completed'
                        });
                        await winnerRecord.save();
                        console.log(`Created winner record for round ${round}`);

                        // Update user's total winnings
                        User.totalWinnings = (BigInt(User.totalWinnings) + BigInt(amount.toString())).toString();
                        await User.save();

                        // Update equb
                        equb.currentRound = round.toString();
                        equb.totalPool = '0';
                        await equb.save();
                    }
                }
            }
        } catch (error) {
            console.error('Error handling WinnerSelected event:', error);
        }
    });

    console.log('Event listeners started successfully');
};

// Stop event listeners
export const stopEventListeners = (contractAddress) => {
    const provider = getProvider();
    const contract = getEqubContract(contractAddress, provider);
    
    contract.removeAllListeners();
    console.log('Event listeners stopped');
};

export default {
    startEventListeners,
    stopEventListeners
};
