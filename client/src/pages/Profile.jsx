import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Wallet } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { getUserData } from '../services/authService';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Profile = () => {
  const { user: contextUser, logout } = useAuth();
  const [user, setUser] = useState(contextUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        if (data.success) {
            setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold font-display text-white mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar / Identity Card */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardContent className="flex flex-col items-center pt-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-4xl font-bold text-white mb-4 ring-4 ring-white/10">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User size={40} />}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-slate-400 text-sm mb-6">{user.role || 'Member'}</p>
                
                <div className="w-full space-y-2">
                  <Button variant="outline" className="w-full text-red-400 hover:bg-red-500/10 hover:border-red-500/30" onClick={logout}>
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Card */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase">Verification Status</label>
                    <div className="flex items-center gap-2">
                        {user.IsAccVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20">
                                <Shield size={12} className="mr-1" /> Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                                Unverified
                            </span>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase">Email Address</label>
                    <div className="flex items-center gap-3 text-slate-200">
                      <Mail size={18} className="text-primary-500" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  {user.phoneNumber && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 uppercase">Phone Number</label>
                        <div className="flex items-center gap-3 text-slate-200">
                        <Phone size={18} className="text-primary-500" />
                        <span>{user.phoneNumber}</span>
                        </div>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase">Wallet Address</label>
                    <div className="flex items-center gap-3 text-slate-200 bg-white/5 p-3 rounded-lg border border-white/10 break-all">
                      <Wallet size={18} className="text-primary-500 shrink-0" />
                      <span className="font-mono text-sm">{user.walletAddress || 'No wallet linked'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

             {/* Stats Summary */}
             <div className="mt-6 grid grid-cols-2 gap-4">
                <Card className="bg-primary-500/5">
                    <CardContent className="p-4 flex flex-col items-center">
                        <span className="text-3xl font-bold text-white mb-1">{user.activeEqubCount || 0}</span>
                        <span className="text-xs text-slate-400 uppercase font-medium">Active Equbs</span>
                    </CardContent>
                </Card>
                <Card className="bg-secondary-500/5">
                    <CardContent className="p-4 flex flex-col items-center">
                        <span className="text-3xl font-bold text-white mb-1">{user.totalContributions || 0} ETH</span>
                        <span className="text-xs text-slate-400 uppercase font-medium">Total Contributed</span>
                    </CardContent>
                </Card>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
