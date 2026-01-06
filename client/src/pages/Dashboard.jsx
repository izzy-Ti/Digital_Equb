import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Plus, LayoutGrid, Clock, Users, Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getUserEqubs } from '../services/memberService';
import Button from '../components/ui/Button';
import Card, { CardTitle } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [equbs, setEqubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const customFetchEqubs = async () => {
        try {
            if (user?._id) {
                const data = await getUserEqubs(user._id);
                // Ensure data is array, if backend returns { success: true, data: [] } structure
                setEqubs(Array.isArray(data) ? data : (data.equbs || []));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }
    
    customFetchEqubs();
  }, [user]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.firstName}</p>
        </div>
        <Link to="/create-equb">
          <Button variant="primary" className="shadow-lg shadow-primary-500/20">
            <Plus className="mr-2 w-5 h-5" />
            Create New Equb
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatsCard 
            icon={<Wallet className="text-primary-400" />}
            title="Total Winnings"
            value={`${safeFormatEther(user?.totalWinnings)} ETH`}
            label="Lifetime winnings"
        />
        <StatsCard 
            icon={<Users className="text-secondary-400" />}
            title="Active Equbs"
            value={equbs.length.toString()}
            label="You are participating in"
        />
        <StatsCard 
            icon={<Clock className="text-green-400" />}
            title="Wallet Balance"
            value={user?.walletAddress ? "Connected" : "Not Linked"} // Placeholder until fetching real balance from chain per equb
            label={user?.walletAddress ? `${user.walletAddress.slice(0,6)}...${user.walletAddress.slice(-4)}` : "Connect Wallet"}
        />
      </div>

      {/* My Equbs List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary-500" />
          My Equbs
        </h2>

        {equbs.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Equbs Found</h3>
            <p className="text-slate-400 mb-6">You haven't joined any equbs yet.</p>
            <div className="flex justify-center gap-4">
                <Link to="/create-equb">
                    <Button variant="primary">Create Equb</Button>
                </Link>
                <Link to="/explore">
                    <Button variant="outline">Browse Equbs</Button>
                </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equbs.map((equb) => (
              <DashboardEqubCard key={equb._id} equb={equb} safeFormatEther={safeFormatEther} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCard = ({ icon, title, value, label }) => (
    <Card className="hover:border-primary-500/30">
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-xl">
                {icon}
            </div>
            <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                +12%
            </span>
        </div>
        <div className="text-3xl font-bold text-white mb-1 font-display">{value}</div>
        <div className="text-sm font-medium text-slate-300 mb-1">{title}</div>
        <div className="text-xs text-slate-500">{label}</div>
    </Card>
);

const DashboardEqubCard = ({ equb, safeFormatEther }) => (
    <Card className="group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
                {equb.name ? equb.name.charAt(0) : 'E'}
            </div>
            <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/20 uppercase font-bold tracking-wider">
                {equb.status || 'Active'}
            </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{equb.name}</h3>
        
        <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">Contribution</span>
                <span className="text-white font-mono">{safeFormatEther(equb.contributionAmount)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">Members</span>
                <span className="text-white">{equb.memberCount || 0} / {equb.maxMembers || '-'}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(((equb.memberCount || 0) / (equb.maxMembers || 1)) * 100, 100)}%` }}></div>
            </div>
        </div>

        <Link to={`/equb/${equb._id}`}>
            <Button variant="outline" className="w-full text-sm py-2">
                View Details <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
        </Link>
    </Card>
);

export default Dashboard;
