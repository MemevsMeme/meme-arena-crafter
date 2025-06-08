/**
 * Simple sound effects that will reliably work in all browsers
 * This uses the Web Audio API directly with no external dependencies
 */

// Sound effect interface
export interface SimpleSound {
  id: string;
  name: string;
  category: 'effects' | 'music' | 'voices' | 'custom';
}

// Audio context singleton
let audioContext: AudioContext | null = null;

// Get or create audio context
const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

// Simple beep function
export const playBeep = (
  frequency = 440, 
  duration = 200, 
  volume = 0.3, 
  type: OscillatorType = 'sine'
): void => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
    }, duration);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

// Predefined sound patterns
const soundPatterns = {
  click: () => playBeep(1200, 20, 0.1),
  blip: () => playBeep(880, 50, 0.1),
  beep: () => playBeep(440, 100, 0.1),
  boop: () => playBeep(330, 100, 0.1),
  success: () => {
    playBeep(523.25, 100, 0.1);
    setTimeout(() => playBeep(659.25, 100, 0.1), 100);
    setTimeout(() => playBeep(783.99, 200, 0.1), 200);
  },
  error: () => {
    playBeep(392, 200, 0.1, 'sawtooth');
    setTimeout(() => playBeep(349.23, 300, 0.1, 'sawtooth'), 200);
  },
  alert: () => {
    playBeep(880, 100, 0.1);
    setTimeout(() => playBeep(880, 100, 0.1), 150);
  },
  victory: () => {
    playBeep(440, 100, 0.1);
    setTimeout(() => playBeep(554.37, 100, 0.1), 100);
    setTimeout(() => playBeep(659.25, 300, 0.1), 200);
  },
  sad: () => {
    playBeep(392, 100, 0.1);
    setTimeout(() => playBeep(349.23, 300, 0.1), 100);
  },
  laugh: () => {
    playBeep(523.25, 50, 0.1, 'square');
    setTimeout(() => playBeep(622.25, 50, 0.1, 'square'), 60);
    setTimeout(() => playBeep(523.25, 50, 0.1, 'square'), 120);
    setTimeout(() => playBeep(622.25, 50, 0.1, 'square'), 180);
  },
  achievement: () => {
    playBeep(783.99, 100, 0.1);
    setTimeout(() => playBeep(1046.50, 200, 0.1), 100);
  }
};

// Available sound effects
export const availableSounds: SimpleSound[] = [
  { id: 'click', name: 'Click', category: 'effects' },
  { id: 'blip', name: 'Blip', category: 'effects' },
  { id: 'beep', name: 'Beep', category: 'effects' },
  { id: 'boop', name: 'Boop', category: 'effects' },
  { id: 'success', name: 'Success', category: 'effects' },
  { id: 'error', name: 'Error', category: 'effects' },
  { id: 'alert', name: 'Alert', category: 'effects' },
  { id: 'victory', name: 'Victory', category: 'music' },
  { id: 'sad', name: 'Sad', category: 'music' },
  { id: 'laugh', name: 'Laugh', category: 'voices' },
  { id: 'achievement', name: 'Achievement', category: 'effects' }
];

// Play a sound by ID
export const playSound = (id: string): void => {
  // @ts-ignore - Accessing property with string index
  const soundFn = soundPatterns[id];
  if (soundFn) {
    soundFn();
  } else {
    console.error(`Sound '${id}' not found`);
  }
};

// Set master volume (0-1)
let masterVolume = 0.3;
export const setVolume = (volume: number): void => {
  masterVolume = Math.max(0, Math.min(1, volume));
};

// Get current volume
export const getVolume = (): number => masterVolume;

// Current mute state
let isMuted = false;
export const setMuted = (muted: boolean): void => {
  isMuted = muted;
};

export const getMuted = (): boolean => isMuted;