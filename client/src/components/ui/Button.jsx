import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-primary-500/50 hover:from-primary-500 hover:to-primary-400 hover:shadow-primary-400/60 transition-all duration-300 transform hover:scale-105',
    secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-secondary-500/50 hover:from-secondary-500 hover:to-secondary-400 hover:shadow-secondary-400/60 transition-all duration-300 transform hover:scale-105',
    outline: 'border-2 border-primary-500 text-primary-400 font-semibold py-3 px-6 rounded-xl hover:bg-primary-500/10 hover:border-primary-400 transition-all duration-300',
    ghost: 'text-slate-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-red-500/50 hover:shadow-red-600/60',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
