import React from 'react';

export const ProgressIndicator = ({ step, total }) => {
  return (
    <div className="kiosk-progress-container">
      <span className="kiosk-progress-text">Step {step} of {total}</span>
      <div className="kiosk-progress-bar-bg">
        <div 
          className="kiosk-progress-bar-fill" 
          style={{ width: `${(step / total) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
