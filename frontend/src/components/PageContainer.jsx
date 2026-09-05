import React from 'react';

export const PageContainer = ({ children }) => {
  return (
    <div className="kiosk-page-container">
      <div className="kiosk-page-content">
        {children}
      </div>
    </div>
  );
};
