import React from 'react';

export const ProgressIndicator = ({ step, total }) => {
  return (
    <div className="onboarding-progress-container">
      <div className="onboarding-progress-badge-wrapper">
        <span className="onboarding-progress-badge">
          Step {step} of {total}
        </span>
      </div>
      <div className="onboarding-progress-bar-bg">
        <div 
          className="onboarding-progress-bar-fill" 
          style={{ width: `${(step / total) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
