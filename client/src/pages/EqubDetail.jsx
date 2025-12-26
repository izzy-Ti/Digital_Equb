import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Target, Calendar, Shield, Wallet, Trophy } from 'lucide-react';
import { getEqubById } from '../services/equbService';
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

  useEffect(() => {
    const fetchEqubDetails = async () => {
      try {
        const data = await getEqubById(id);
        if (data.success) {
            setEqub(data.equb);
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
             // 2. Backend Sync (or Member Add) - Currently likely handled by webhooks or manual refresh
             // For now we rely on the contract state. 
             // Ideally we call equbService.joinEqub(id, txHash) if that endpoint exists
             toast.success("Successfully joined on blockchain!", { id: 'join' });
             window.location.reload();
          }
      } catch (error) {
          console.error("Join error:", error);
          const msg = error.reason || error.message || "Failed to join Equb";
          // formatting for readability
          const finalMsg = msg.length > 50 && !msg.includes('Insufficient') ? "Transaction failed. Check console." : msg;
          toast.error(finalMsg, { id: 'join' });
      } finally {
          setIsJoining(false);
      }
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
                            <div className="text-xl font-bold text-white">{equb.contributionAmount} ETH</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <Target className="text-secondary-500 mb-2" size={24} />
                            <div className="text-sm text-slate-400">Total Pool</div>
                            <div className="text-xl font-bold text-white">{(equb.contributionAmount * equb.maxMembers).toFixed(4)} ETH</div>
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
                            <span className="text-white font-mono">{equb.contributionAmount} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Duration</span>
                            <span className="text-white">{equb.cycleDuration} Days</span>
                        </div>
                        
                        <div className="pt-4">
                            {!user ? (
                                <Link to="/login">
                                    <Button className="w-full">Login to Join</Button>
                                </Link>
                            ) : (
                                <Button 
                                    className="w-full" 
                                    onClick={handleJoin}
                                    disabled={isJoining || equb.status === 'ended'}
                                >
                                    {isJoining ? 'Joining...' : 'Join Now'}
                                </Button>
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
