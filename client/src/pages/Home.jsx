import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, Users } from 'lucide-react';
import Button from '../components/ui/Button';

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 -left-64 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-0 -right-64 w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-300">Live on Sepolia Testnet</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display leading-tight animate-slide-up">
              The Future of <br/>
              <span className="gradient-text">Rotating Savings</span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Digital Equb modernizes traditional ROSCA savings groups with blockchain technology. Secure, transparent, and trustless financial collaboration for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/explore">
                <Button variant="primary" className="text-lg px-8 py-4 h-auto w-full sm:w-auto">
                  Start Saving Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" className="text-lg px-8 py-4 h-auto w-full sm:w-auto">
                  How it Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative bg-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 font-display">Why Digital Equb?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              We've resolved the trust issues of traditional equbs by leveraging smart contracts and blockchain transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-primary-400" />}
              title="Trustless Security"
              description="Smart contracts hold funds securely. No single admin controls the pool, eliminating fraud and mismanagement."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-secondary-400" />}
              title="Global Access"
              description="Join savings circles from anywhere in the world using cryptocurrency. Cross-border financial inclusion."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
              title="Automated Rotation"
              description="Winners are selected and paid out automatically by the smart contract. No delays, no manual errors."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="glass-card max-w-5xl mx-auto p-12 border-primary-500/20 glow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="p-4">
                <div className="text-4xl font-bold text-white mb-2 font-display">100+</div>
                <div className="text-slate-400">Active Equbs</div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold text-white mb-2 font-display">500 ETH</div>
                <div className="text-slate-400">Total Volume</div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold text-white mb-2 font-display">2.5k+</div>
                <div className="text-slate-400">Community Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-900/50 to-secondary-900/50 rounded-3xl p-12 text-center border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">Ready to start your savings journey?</h2>
              <p className="text-slate-300 mb-8 text-lg">
                Join a community of savers and achieve your financial goals together.
                Transparent, secure, and powered by Web3.
              </p>
              <Link to="/register">
                <Button variant="primary" className="text-lg px-8 py-4 h-auto shadow-2xl">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card hover:-translate-y-2 transition-transform duration-300">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed">
      {description}
    </p>
  </div>
);

export default Home;
