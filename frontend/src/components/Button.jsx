import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`kiosk-btn kiosk-btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};
