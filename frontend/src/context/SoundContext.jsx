import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSafeChime, playFraudAlarm, playWarningBeep, speakAlert } from '../services/soundEffects';

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('upishield_sound_enabled') !== 'false';
  });
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem('upishield_voice_enabled') !== 'false';
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('upishield_volume');
    return saved ? parseFloat(saved) : 0.6;
  });

  useEffect(() => {
    localStorage.setItem('upishield_sound_enabled', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('upishield_voice_enabled', voiceEnabled);
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('upishield_volume', volume);
  }, [volume]);

  const triggerSafeAlert = (amount = null) => {
    if (soundEnabled) {
      playSafeChime(volume);
    }
    if (voiceEnabled && amount) {
      setTimeout(() => {
        speakAlert(`Payment of ${amount} rupees verified safely`);
      }, 500);
    }
  };

  const triggerFraudAlert = () => {
    if (soundEnabled) {
      playFraudAlarm(volume);
    }
    if (voiceEnabled) {
      setTimeout(() => {
        speakAlert('Security Alert: Fraudulent Payment Detected');
      }, 400);
    }
  };

  const triggerWarningAlert = () => {
    if (soundEnabled) {
      playWarningBeep(volume);
    }
  };

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        voiceEnabled,
        setVoiceEnabled,
        volume,
        setVolume,
        triggerSafeAlert,
        triggerFraudAlert,
        triggerWarningAlert,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
