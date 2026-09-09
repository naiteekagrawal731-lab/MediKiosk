import React from 'react';
import { KioskHeader } from './KioskHeader';
import HealthcareBackground from './HealthcareBackground';

export const PageContainer = ({ children, hideHeader = false }) => {
  return (
    <div className="kiosk-page-container">
      {/* Illustrated healthcare background – behind all content */}
      <HealthcareBackground />

      {!hideHeader && <KioskHeader />}
      <div className="kiosk-page-wrapper">
        {children}
      </div>
    </div>
  );
};
