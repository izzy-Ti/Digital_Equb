import React from 'react';
import { ethers } from 'ethers';
import { Users, Clock, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';

const EqubCard = ({ equb }) => {
  const safeFormatEther = (value) => {
    if (!value) return '0';
    const strValue = value.toString();
    // If it's already a decimal (contains a dot), assume it's already ETH
    if (strValue.includes('.')) return strValue;
    try {
      return ethers.formatEther(strValue);
    } catch (e) {
      console.error("Format error for value:", value, e);
      return strValue;
    }
  };

  return (
    <Card className="hover:border-primary-500/50 transition-colors group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
              {equb.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              equb.status === 'active' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {equb.status === 'active' ? 'Active' : 'Pending'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {safeFormatEther(equb.contributionAmount)} ETH
            </p>
            <p className="text-xs text-slate-400 uppercase">Contribution</p>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
          {equb.description || 'No description provided.'}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-300">
            <Users size={16} className="text-primary-500" />
            <span className="text-sm">
               {equb.members ? equb.members.length : 0} / {equb.maxMembers} Members
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={16} className="text-primary-500" />
            <span className="text-sm">{equb.cycleDuration} Days Cycle</span>
          </div>
        </div>

        <Link to={`/equb/${equb._id}`}>
          <Button variant="outline" className="w-full group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all">
            View Details <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EqubCard;
