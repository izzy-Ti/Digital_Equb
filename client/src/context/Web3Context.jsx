import { createContext, useState, useEffect, useContext } from 'react';
import web3Service from '../services/web3Service';
import toast from 'react-hot-toast';
import { linkWallet } from '../services/authService';

export const Web3Context = createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      if (web3Service.isMetaMaskInstalled()) {
        try {
          const currentAccount = await web3Service.initialize(); // Use initialize
          if (currentAccount) {
            setAccount(currentAccount);
            setIsActive(true);
            const bal = await web3Service.getBalance(currentAccount);
            setBalance(bal);
          }
        } catch (err) {
            console.error("Failed to init web3", err);
        } finally {
            setIsLoading(false);
        }

        // Listen for account changes
        web3Service.onAccountsChanged((accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsActive(true);
             web3Service.getBalance(accounts[0]).then(b => setBalance(b));
            toast.success('Wallet account changed');
          } else {
            setAccount(null);
            setIsActive(false);
            setBalance('0');
            toast('Wallet disconnected');
          }
        });

        // Listen for chain changes
        web3Service.onChainChanged((_chainId) => {
          setChainId(_chainId);
          window.location.reload(); 
        });

      } else {
          setIsLoading(false);
      }
    };

    initWeb3();
  }, []);

  // Connect Wallet
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const connectedAccount = await web3Service.connectWallet();
      setAccount(connectedAccount);
      setIsActive(true);
      const bal = await web3Service.getBalance(connectedAccount);
      setBalance(bal);
      
      // Save wallet address to backend
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user._id) {
                 await linkWallet(connectedAccount);
                 toast.success('Wallet linked to account!');
            }
        }
      } catch (linkError) {
        console.error("Failed to link wallet to backend", linkError);
        // Don't fail the whole connection, just warn if it's strictly a linking error
        // If "Wallet already linked", we might want to notify user but not break
        if (linkError.toString().includes('already linked')) {
             toast.error(linkError.toString());
        } else {
             // specific error or ignore
        }
      }

      toast.success('Wallet connected successfully!');
    } catch (err) {
      console.error("Connection failed", err);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect Wallet (Client-side clear)
  const disconnectWallet = () => {
    web3Service.disconnectWallet();
    setAccount(null);
    setIsActive(false);
    setBalance('0');
    toast.success('Wallet disconnected');
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        isActive,
        balance,
        chainId,
        isLoading,
        connectWallet,
        disconnectWallet,
        web3: web3Service 
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
