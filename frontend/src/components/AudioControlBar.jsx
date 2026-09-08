import React from 'react';
import { translations } from '../utils/translations';

export const AudioControlBar = ({ onPlayAudio, volume, setVolume, isMuted, setIsMuted, lang = 'EN' }) => {
  const t = translations[lang] || translations['EN'];

  return (
    <div className="audio-controls-row">
      <button 
        type="button" 
        onClick={onPlayAudio} 
        className="play-audio-btn-inline"
        title={t.playAudio}
      >
        <span className="audio-icon-wrapper-small">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </span>
        <span>{t.playAudio}</span>
      </button>

      <div className="volume-group">
        <label htmlFor="volume-slider">{t.volumeLabel || 'Volume:'}</label>
        <input 
          id="volume-slider"
          type="range" 
          min="0" max="1" step="0.1" 
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="kiosk-slider"
        />
      </div>

      <div className="mute-group">
        <input 
          type="checkbox" 
          id="mute-toggle" 
          checked={isMuted} 
          onChange={(e) => setIsMuted(e.target.checked)} 
          className="kiosk-checkbox"
        />
        <label htmlFor="mute-toggle">{t.muteLabel || 'Mute'}</label>
      </div>
    </div>
  );
};
