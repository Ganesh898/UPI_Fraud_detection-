// Web Audio API Synthesizer for UPI Shield Real-Time Alerts
// Completely client-side, zero external audio assets required

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSafeChime = (volume = 0.5) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Pleasant 2-tone melodic harmonic chime (C6 -> E6 -> G6)
    const tones = [
      { freq: 1046.5, start: 0, duration: 0.15 },
      { freq: 1318.5, start: 0.12, duration: 0.25 },
      { freq: 1567.98, start: 0.26, duration: 0.45 },
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.2 * volume, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch (err) {
    console.warn('Audio playback not allowed or failed:', err);
  }
};

export const playFraudAlarm = (volume = 0.6) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Urgent alternating siren (880Hz <-> 587Hz)
    const sirenPulses = [0, 0.2, 0.4, 0.6];

    sirenPulses.forEach((pulseStart, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = index % 2 === 0 ? 'sawtooth' : 'triangle';
      const freq = index % 2 === 0 ? 880 : 587.33;
      osc.frequency.setValueAtTime(freq, now + pulseStart);

      gain.gain.setValueAtTime(0.25 * volume, now + pulseStart);
      gain.gain.exponentialRampToValueAtTime(0.01 * volume, now + pulseStart + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + pulseStart);
      osc.stop(now + pulseStart + 0.19);
    });
  } catch (err) {
    console.warn('Audio playback failed:', err);
  }
};

export const playWarningBeep = (volume = 0.4) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);

    gain.gain.setValueAtTime(0.15 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (err) {
    console.warn('Audio playback failed:', err);
  }
};

export const speakAlert = (text) => {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
};
