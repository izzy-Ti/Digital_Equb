import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import useWeb3 from '../../hooks/useWeb3';
import Button from '../ui/Button';
import { formatAddress } from '../../utils/formatters';

const WalletConnect = () => {
  const { account, isActive, balance, connectWallet, disconnectWallet, isLoading } = useWeb3();

  if (isActive && account) {
    return (
      <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-1.5 pr-4 border border-slate-700">
        <div className="bg-slate-900 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 border border-slate-700">
          {parseFloat(balance).toFixed(4)} ETH
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-white font-mono">
            {formatAddress(account)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="ml-2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          title="Disconnect Wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={connectWallet}
      isLoading={isLoading}
      className="text-sm py-2 px-4 shadow-primary-500/20"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
};

export default WalletConnect;
