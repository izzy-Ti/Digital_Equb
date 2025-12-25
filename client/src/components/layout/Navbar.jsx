import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon, User, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import WalletConnect from '../wallet/WalletConnect';
import Button from '../ui/Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Hexagon className="w-10 h-10 text-primary-500 absolute inset-0 transition-transform group-hover:rotate-180 duration-700" strokeWidth={1.5} />
              <span className="text-xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">E</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Digital Equb
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/explore" active={isActive('/explore')}>Explore</NavLink>
            <NavLink to="/how-it-works" active={isActive('/how-it-works')}>How it Works</NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <WalletConnect />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                <Link to="/profile">
                  <div className="flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-white/5 transition-all text-slate-300 hover:text-white group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent group-hover:ring-primary-500/50 transition-all">
                      {user?.firstName?.charAt(0) || <User size={14} />}
                    </div>
                    <span className="text-sm font-medium">{user?.firstName || 'User'}</span>
                  </div>
                </Link>
                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="text-sm py-2 px-4 shadow-none">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-white/5 animate-slide-down">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <MobileNavLink to="/explore" onClick={toggleMenu}>Explore</MobileNavLink>
            <MobileNavLink to="/how-it-works" onClick={toggleMenu}>How it Works</MobileNavLink>
            {isAuthenticated && (
              <MobileNavLink to="/dashboard" onClick={toggleMenu}>Dashboard</MobileNavLink>
            )}
            
            <div className="h-px bg-white/10 my-4"></div>
            
            <div className="flex flex-col gap-4">
              <WalletConnect />
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={toggleMenu}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                      {user?.firstName?.charAt(0) || <User size={14} />}
                    </div>
                    <div>
                      <div className="font-medium">{user?.name || 'User'}</div>
                      <div className="text-xs text-slate-400">{user?.email}</div>
                    </div>
                  </Link>
                  <button 
                    onClick={() => { logout(); toggleMenu(); }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" onClick={toggleMenu}>
                    <Button variant="outline" className="w-full justify-center">Login</Button>
                  </Link>
                  <Link to="/register" onClick={toggleMenu}>
                    <Button variant="primary" className="w-full justify-center">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`text-sm font-medium transition-colors hover:text-white relative py-1 ${
      active ? 'text-white' : 'text-slate-400'
    }`}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"></span>
    )}
  </Link>
);

const MobileNavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block text-lg font-medium text-slate-300 hover:text-white py-2"
  >
    {children}
  </Link>
);

export default Navbar;
