import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Target, Calendar, Shield, Wallet, Trophy } from 'lucide-react';
import { getEqubById, startEqub } from '../services/equbService';
import { joinEqub, checkMembership } from '../services/memberService';
import { recordContribution, getRoundStats } from '../services/contributionService';
import { assignWinner, getEqubWinners } from '../services/winnerService';
import { useWeb3 } from '../context/Web3Context';
import useAuth from '../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EqubDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { web3, account, connectWallet } = useWeb3();

  const [equb, setEqub] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [memberInfo, setMemberInfo] = useState(null);
  const [roundStats, setRoundStats] = useState(null);
  const [eligibleMembers, setEligibleMembers] = useState([]);

  const safeFormatEther = (value) => {
    if (!value) return '0';
    const strValue = value.toString();
    if (strValue.includes('.')) return strValue;
    try {
      return ethers.formatEther(strValue);
    } catch (e) {
      return strValue;
    }
  };

  const calculateTotalPool = () => {
    if (!equb?.contributionAmount || !equb?.maxMembers) return '0';
    try {
        const amount = equb.contributionAmount.toString();
        if (amount.includes('.')) {
            return (parseFloat(amount) * parseInt(equb.maxMembers)).toFixed(4);
        }
        return ethers.formatEther((BigInt(amount) * BigInt(equb.maxMembers)).toString());
    } catch (e) {
        console.error("Pool calculation error:", e);
        return '0';
    }
  };

  useEffect(() => {
    const fetchEqubDetails = async () => {
      try {
        const data = await getEqubById(id);
        if (data.success) {
            setEqub(data.equb);
            
            // Fetch membership info if logged in
            if (user) {
                const memData = await checkMembership(id, user._id);
                if (memData.success) {
                    setIsMember(memData.isMember);
                    setMemberInfo(memData.memberInfo);
                }
            }

            // Fetch round stats
            const statsData = await getRoundStats(id, data.equb.currentRound || 1);
            if (statsData.success) {
                setRoundStats(statsData.stats);
            }
        } else {
            toast.error(data.message || "Failed to load Equb details");
        }
      } catch (error) {
        console.error("Error fetching equb:", error);
        toast.error("Error loading Equb details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEqubDetails();
  }, [id]);

  const handleJoin = async () => {
      if (!user) {
          toast.error("Please login to join");
          return;
      }
      if (!account) {
          connectWallet();
          return;
      }
      
      setIsJoining(true);
      try {
          // 1. Blockchain Join
          toast.loading("Joining on blockchain...", { id: 'join' });
          const tx = await web3.joinEqub(equb.blockchainEqubId, equb.contributionAmount);
          
          if (tx && tx.txHash) {
             toast.loading("Syncing with server...", { id: 'join' });
             const response = await joinEqub(user._id, equb._id, account);
             
             if (response.success) {
                toast.success("Successfully joined Equb!", { id: 'join' });
                window.location.reload();
             } else {
                throw new Error(response.message || "Blockchain success, but server sync failed.");
             }
          }
      } catch (error) {
          console.error("Join error:", error);
          const msg = error.reason || error.message || "Failed to join Equb";
          const finalMsg = msg.length > 50 && !msg.includes('Insufficient') ? "Transaction failed. Check console." : msg;
          toast.error(finalMsg, { id: 'join' });
      } finally {
          setIsJoining(false);
      }
  };

  const handleStart = async () => {
      if (!account) {
          connectWallet();
          return;
      }
      
      setIsStarting(true);
      try {
          toast.loading("Starting Equb...", { id: 'start' });
          const tx = await web3.startEqub(equb.blockchainEqubId);
          if (tx && tx.txHash) {
              toast.loading("Syncing with server...", { id: 'start' });
              const response = await startEqub(equb._id, user._id);
              
              if (response.success) {
                  toast.success("Equb started successfully!", { id: 'start' });
                  window.location.reload();
              } else {
                  throw new Error(response.message || "Blockchain success, but server sync failed.");
              }
          }
      } catch (error) {
          console.error("Start error:", error);
          toast.error(error.reason || error.message || "Failed to start Equb", { id: 'start' });
      } finally {
          setIsStarting(false);
      }
  };

  const handleContribute = async () => {
      if (!user) {
          toast.error("Please login to contribute");
          return;
      }
      if (!account) {
          connectWallet();
          return;
      }
      
      setIsContributing(true);
      try {
          toast.loading("Contributing on blockchain...", { id: 'contribute' });
          const tx = await web3.contribute(equb.blockchainEqubId, equb.contributionAmount);
          
          if (tx && tx.txHash) {
              toast.loading("Recording contribution...", { id: 'contribute' });
              const response = await recordContribution({
                  userId: user._id,
                  equbId: equb._id,
                  amount: equb.contributionAmount,
                  round: equb.currentRound || 1,
                  txHash: tx.txHash
              });
              
              if (response.success) {
                  toast.success("Contribution successful!", { id: 'contribute' });
                  window.location.reload();
              } else {
                  throw new Error(response.message || "Blockchain success, but server sync failed.");
              }
          }
      } catch (error) {
          console.error("Contribution error:", error);
          toast.error(error.reason || error.message || "Failed to make contribution", { id: 'contribute' });
      } finally {
          setIsContributing(false);
      }
  };

  const handleSelectWinner = async () => {
      if (!account) {
          connectWallet();
          return;
      }
      
      toast.info("Winner selection is best performed from the Admin Dashboard for better control over eligible members.", { id: 'winner' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!equb) {
      return (
          <div className="container mx-auto px-4 py-20 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Equb Not Found</h2>
              <Link to="/explore">
                  <Button variant="outline"><ArrowLeft size={16} className="mr-2"/> Back to Explore</Button>
              </Link>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/explore" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl mb-2">{equb.name}</CardTitle>
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    equb.status === 'active' 
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                    {equb.status === 'active' ? 'Active' : 'Pending'}
                                </span>
                                <span className="text-slate-400 text-sm flex items-center gap-1">
                                    <Clock size={14} /> {equb.cycleDuration} Days Cycle
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-invert max-w-none text-slate-300">
                        <p>{equb.description || "No description provided."}</p>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <Wallet className="text-primary-500 mb-2" size={24} />
                            <div className="text-sm text-slate-400">Contribution</div>
                            <div className="text-xl font-bold text-white">
                                {safeFormatEther(equb.contributionAmount)} ETH
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <Target className="text-secondary-500 mb-2" size={24} />
                            <div className="text-sm text-slate-400">Total Pool</div>
                            <div className="text-xl font-bold text-white">
                                {calculateTotalPool()} ETH
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <Users className="text-blue-400 mb-2" size={24} />
                            <div className="text-sm text-slate-400">Members</div>
                            <div className="text-xl font-bold text-white">{equb.memberCount || 0} / {equb.maxMembers}</div>
                        </div>
                         <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <Trophy className="text-yellow-400 mb-2" size={24} />
                            <div className="text-sm text-slate-400">Rounds</div>
                            <div className="text-xl font-bold text-white">{equb.currentRound || 1}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Members List (Simplified) */}
            <Card>
                <CardHeader><CardTitle>Participants</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-slate-400 text-sm">Member list visibility is limited to participants.</p>
                </CardContent>
            </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
            <Card className="border-primary-500/30 bg-primary-500/5">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Join this Equb</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Cycle Amount</span>
                            <span className="text-white font-mono">{safeFormatEther(equb.contributionAmount)} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Duration</span>
                            <span className="text-white">{equb.cycleDuration} Days</span>
                        </div>
                        
                        <div className="pt-4 space-y-3">
                            {!user ? (
                                <Link to="/login">
                                    <Button className="w-full">Login to Join</Button>
                                </Link>
                            ) : (
                                <>
                                    {/* Show Start button if user is owner and it's pending */}
                                    {equb.creatorId?._id === user?._id && equb.status === 'pending' && (
                                         <Button 
                                            variant="secondary"
                                            className="w-full mb-3" 
                                            onClick={handleStart}
                                            disabled={isStarting}
                                        >
                                            {isStarting ? 'Starting...' : '🚀 Start Equb'}
                                        </Button>
                                    )}

                                    {/* Show Join button if not a member and status is active */}
                                    {!isMember && equb.status === 'active' && (
                                        <Button 
                                            className="w-full" 
                                            onClick={handleJoin}
                                            disabled={isJoining || equb.memberCount >= equb.maxMembers}
                                        >
                                            {isJoining ? 'Joining...' : 'Join Now'}
                                        </Button>
                                    )}

                                    {/* Show Contribute button if member and status is active */}
                                    {isMember && equb.status === 'active' && (
                                        <Button 
                                            variant="primary"
                                            className="w-full" 
                                            onClick={handleContribute}
                                            disabled={isContributing}
                                        >
                                            {isContributing ? 'Processing...' : '💰 Pay Contribution'}
                                        </Button>
                                    )}

                                    {/* Show Waiting message if pending and not owner */}
                                    {equb.status === 'pending' && equb.creatorId?._id !== user?._id && (
                                        <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 text-sm">
                                            Waiting for creator to start...
                                        </div>
                                    )}

                                    {/* Show Winner Selection if owner and status is active (Simplified) */}
                                    {equb.creatorId?._id === user?._id && equb.status === 'active' && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-xs text-slate-500 mb-2 text-center">Admin Controls</p>
                                            <Button 
                                                variant="outline"
                                                className="w-full border-secondary-500/50 text-secondary-400 hover:bg-secondary-500/10" 
                                                onClick={handleSelectWinner}
                                            >
                                                🏆 Select Round Winner
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-2">
                            By joining, you agree to the smart contract terms.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-white mb-3">Referees / Creator</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                            {equb.creatorId?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <div className="text-white font-medium">{equb.creatorId?.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-400">Creator</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default EqubDetail;
