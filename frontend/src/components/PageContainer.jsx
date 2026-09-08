import React from 'react';
import { KioskHeader } from './KioskHeader';

export const PageContainer = ({ children, hideHeader = false }) => {
  return (
    <div className="kiosk-page-container">
      {!hideHeader && <KioskHeader />}
      <div className="kiosk-page-wrapper">
        {children}
      </div>
    </div>
  );
};

