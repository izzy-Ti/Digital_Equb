import { getProvider, getEqubContract } from './web3.js';
import { Contribution } from '../models/contribution.js';
import { Winner } from '../models/winner.js';
import { EqubMember } from '../models/equbMember.js';
import Equb from '../models/equb.js';
import { user } from '../models/user.js';

// Listen to blockchain events and update database
export const startEventListeners = (contractAddress) => {
    const provider = getProvider();
    const contract = getEqubContract(contractAddress, provider);

    console.log('Starting blockchain event listeners...');

    // Generic Success Event Listener (since contract emits success(true) for most actions)
    contract.on('success', (status, event) => {
        console.log(`Success event detected: ${status}, Tx: ${event.log.transactionHash}`);
    });

    // EqubStarted events
    contract.on('EqubStarted', async (equbId, event) => {
        console.log(`EqubStarted: ID=${equbId}`);
        try {
            const equb = await Equb.findOne({ blockchainEqubId: equbId.toString() });
            if (equb && equb.status !== 'active') {
                equb.status = 'active';
                equb.startTime = new Date();
                await equb.save();
                console.log(`Updated equb ${equbId} status to active via listener`);
            }
        } catch (error) {
            console.error('Error handling EqubStarted event:', error);
        }
    });

    // MemberJoined events
    contract.on('MemberJoined', async (equbId, member, event) => {
        console.log(`MemberJoined: EqubID=${equbId}, Member=${member}`);
        try {
            const equb = await Equb.findOne({ blockchainEqubId: equbId.toString() });
            const User = await user.findOne({ walletAddress: member.toLowerCase() });

            if (equb && User) {
                const existingMember = await EqubMember.findOne({ equbId: equb._id, userId: User._id });
                if (!existingMember) {
                    const memberCount = await EqubMember.countDocuments({ equbId: equb._id });
                    const newMember = new EqubMember({
                        equbId: equb._id,
                        userId: User._id,
                        walletAddress: member.toLowerCase(),
                        joinOrder: memberCount + 1
                    });
                    await newMember.save();
                    
                    equb.memberCount += 1;
                    await equb.save();

                    User.activeEqubCount += 1;
                    await User.save();
                    console.log(`Sync: Added member ${member} to equb ${equbId} via listener`);
                }
            }
        } catch (error) {
            console.error('Error handling MemberJoined event:', error);
        }
    });

    // ContributionMade events
    contract.on('ContributionMade', async (equbId, member, amount, round, event) => {
        console.log(`ContributionMade: EqubID=${equbId}, Member=${member}, Amount=${amount}, Round=${round}`);
        
        try {
            const txHash = event.log.transactionHash;
            const blockNumber = event.log.blockNumber;

            let contribution = await Contribution.findOne({ txHash });
            
            if (contribution) {
                contribution.status = 'confirmed';
                contribution.blockNumber = blockNumber;
                await contribution.save();
            } else {
                const User = await user.findOne({ walletAddress: member.toLowerCase() });
                const equb = await Equb.findOne({ blockchainEqubId: equbId.toString() });

                if (User && equb) {
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

                    // Update equb total pool using BigInt
                    equb.totalPool = (BigInt(equb.totalPool || '0') + BigInt(amount.toString())).toString();
                    await equb.save();
                    console.log(`Sync: Recorded contribution from ${member} via listener`);
                }
            }
        } catch (error) {
            console.error('Error handling ContributionMade event:', error);
        }
    });

    // WinnerSelected events
    contract.on('WinnerSelected', async (equbId, winner, amount, round, event) => {
        console.log(`WinnerSelected: EqubID=${equbId}, Winner=${winner}, Amount=${amount}, Round=${round}`);
        
        try {
            const txHash = event.log.transactionHash;
            const blockNumber = event.log.blockNumber;

            const User = await user.findOne({ walletAddress: winner.toLowerCase() });
            const equb = await Equb.findOne({ blockchainEqubId: equbId.toString() });

            if (User && equb) {
                const existingWinner = await Winner.findOne({ equbId: equb._id, round: round.toString() });

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

                    // Update user's total winnings using BigInt
                    User.totalWinnings = (BigInt(User.totalWinnings || '0') + BigInt(amount.toString())).toString();
                    await User.save();

                    // Update equb
                    equb.currentRound = round.toString();
                    equb.totalPool = '0';
                    await equb.save();
                    console.log(`Sync: Recorded winner ${winner} for round ${round} via listener`);
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
