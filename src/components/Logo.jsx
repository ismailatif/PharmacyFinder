import React from 'react';

const Logo = ({ className = "h-8 w-8" }) => {
  return (
    <img 
      src="/logo.png" 
      alt="Pharmacies de Garde Logo" 
      className={`object-contain ${className}`}
    />
  );
};

export default Logo;