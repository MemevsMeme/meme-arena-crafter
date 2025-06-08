// This file provides simple sound effects using the Web Audio API
// These are reliable audio effects that work without external files

/**
 * Play a beep sound with the specified parameters
 */
export function playBeep(
  frequency = 440, 
  duration = 200, 
  volume = 0.5, 
  type: OscillatorType = 'sine'
): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, duration);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// Predefined sound effects
export const soundEffects = {
  // UI feedback sounds
  buttonClick: () => playBeep(800, 100, 0.3, 'sine'),
  notification: () => playBeep(880, 150, 0.3, 'sine'),
  error: () => playBeep(220, 300, 0.4, 'sawtooth'),
  success: () => playBeep(1200, 100, 0.2, 'sine'),
  
  // Game-like sounds
  achievement: () => {
    playBeep(880, 100, 0.3, 'sine');
    setTimeout(() => playBeep(1320, 200, 0.3, 'sine'), 150);
  },
  victory: () => {
    playBeep(440, 100, 0.3, 'sine');
    setTimeout(() => playBeep(554, 100, 0.3, 'sine'), 100);
    setTimeout(() => playBeep(659, 300, 0.3, 'sine'), 200);
  },
  
  // Meme sounds
  laugh: () => {
    // Simple laugh pattern
    playBeep(480, 100, 0.3, 'square');
    setTimeout(() => playBeep(520, 100, 0.3, 'square'), 120);
    setTimeout(() => playBeep(480, 100, 0.3, 'square'), 240);
    setTimeout(() => playBeep(520, 100, 0.3, 'square'), 360);
  },
  applause: () => {
    // Applause-like sound
    playBeep(800, 300, 0.2, 'sawtooth');
  },
  sadTrombone: () => {
    // Descending notes
    playBeep(440, 150, 0.3, 'sine');
    setTimeout(() => playBeep(392, 150, 0.3, 'sine'), 150);
    setTimeout(() => playBeep(349, 150, 0.3, 'sine'), 300);
    setTimeout(() => playBeep(294, 300, 0.3, 'sine'), 450);
  },
  airhorn: () => {
    // Air horn sound
    playBeep(466, 400, 0.4, 'sawtooth');
  },
  drumroll: () => {
    // Simple drumroll
    const duration = 1000; // 1 second
    const interval = 50; // 50ms between beats
    let time = 0;
    
    const playBeat = () => {
      playBeep(300, 20, 0.1, 'square');
    };
    
    const intervalId = setInterval(() => {
      playBeat();
      time += interval;
      if (time >= duration) {
        clearInterval(intervalId);
      }
    }, interval);
  }
};