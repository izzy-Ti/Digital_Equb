import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Wallet } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent } from '../components/ui/Card';
import useAuth from '../hooks/useAuth';
import useWeb3 from '../hooks/useWeb3';
import { createEqub } from '../services/equbService';
import toast from 'react-hot-toast';

const CreateEqub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { web3, isActive, account, connectWallet } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    cycleDuration: '',
    maxMembers: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isActive || !account) {
        toast.error("Please connect your wallet first");
        return;
    }

    setIsLoading(true);
    try {
        // 1. Create on Blockchain
        toast.loading("Creating Equb on blockchain...", { id: 'create-equb' });
        
        const txResult = await web3.createEqub(
            formData.name,
            formData.contributionAmount,
            formData.cycleDuration,
            formData.maxMembers
        );

        if (!txResult || !txResult.equbId) {
            throw new Error("Failed to get Equb ID from blockchain event");
        }

        toast.loading("Saving Equb details...", { id: 'create-equb' });

        // 2. Save to Backend
        const backendData = {
            userId: user._id,
            name: formData.name,
            description: formData.description,
            contributionAmount: formData.contributionAmount,
            cycleDuration: formData.cycleDuration,
            maxMembers: formData.maxMembers,
            blockchainEqubId: txResult.equbId,
            creatorWallet: account,
            // contractAddress: EQUB_CONTRACT_ADDRESS // Handled by backend or env if needed
        };

        const response = await createEqub(backendData);

        if (response.success) {
            toast.success("Equb created successfully!", { id: 'create-equb' });
            navigate('/dashboard');
        } else {
            throw new Error(response.message || "Failed to save equb to server");
        }

    } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to create Equb", { id: 'create-equb' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold font-display text-white mb-6">Create New Equb</h1>
        <Card>
          <CardContent>
            {!isActive && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 text-yellow-400">
                        <AlertCircle size={20} />
                        <span className="text-sm">Connect wallet to create an equb</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={connectWallet}>
                        Connect
                    </Button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                name="name" 
                label="Equb Name" 
                placeholder="My Savings Group" 
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input 
                name="description" 
                label="Description" 
                placeholder="Brief description of the group purpose..." 
                value={formData.description}
                onChange={handleChange}
              />
              <Input 
                name="contributionAmount" 
                label="Contribution Amount (ETH)" 
                type="number" 
                placeholder="0.01" 
                step="0.0001"
                value={formData.contributionAmount}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                  <Input 
                    name="cycleDuration" 
                    label="Cycle (Days)" 
                    type="number" 
                    placeholder="7" 
                    value={formData.cycleDuration}
                    onChange={handleChange}
                    required
                  />
                  <Input 
                    name="maxMembers" 
                    label="Max Members" 
                    type="number" 
                    placeholder="10" 
                    value={formData.maxMembers}
                    onChange={handleChange}
                    required
                  />
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full"
                isLoading={isLoading}
                disabled={!isActive}
              >
                {isLoading ? 'Creating...' : 'Create Equb'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEqub;
