import React from 'react';
import { Volume2 } from 'lucide-react';

export const SpeakerButton = ({ onClick }) => {
  return (
    <button 
      className="kiosk-speaker-btn" 
      onClick={onClick} 
      aria-label="Read question aloud"
      title="Listen"
    >
      <Volume2 size={36} color="currentColor" />
    </button>
  );
};
