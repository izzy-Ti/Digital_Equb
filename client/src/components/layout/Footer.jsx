import React from 'react';
import { Hexagon, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950/50 border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group w-fit">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <Hexagon className="w-8 h-8 text-primary-500 absolute inset-0" strokeWidth={1.5} />
                <span className="text-lg font-bold text-white">E</span>
              </div>
              <span className="text-lg font-bold text-white">Digital Equb</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Revolutionizing traditional savings groups with blockchain technology. Secure, transparent, and decentralized financial collaboration.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/explore" className="hover:text-primary-400 transition-colors">Explore Equbs</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary-400 transition-colors">How it Works</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">Fees & Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/security" className="hover:text-primary-400 transition-colors">Security</Link></li>
              <li><Link to="/disclaimer" className="hover:text-primary-400 transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-6">Connect</h4>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Github size={20} />} />
              <SocialLink href="#" icon={<Twitter size={20} />} />
              <SocialLink href="#" icon={<Linkedin size={20} />} />
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Digital Equb. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon }) => (
  <a
    href={href}
    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary-500/20 hover:text-primary-400 transition-all hover:scale-110"
  >
    {icon}
  </a>
);

export default Footer;
