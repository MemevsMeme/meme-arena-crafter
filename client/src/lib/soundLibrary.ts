import { Howl } from 'howler';

// Define categories for sounds
export type SoundCategory = 'effects' | 'music' | 'voices' | 'custom';

// Define a Sound interface
export interface MemeSound {
  id: string;
  name: string;
  url: string;
  category: SoundCategory;
  howl?: Howl;
  duration?: number;
}

// Centralized sound library with professional sound effects
class SoundLibrary {
  private sounds: MemeSound[] = [];
  private globalVolume: number = 0.5;
  private isMuted: boolean = false;
  
  constructor() {
    this.initializeSounds();
  }
  
  // Initialize default sounds using direct browser Audio API for reliability
  private initializeSounds() {
    // For better reliability, we'll use direct Audio API generated sounds
    // These will always work regardless of network issues
    
    // Function to create sine wave oscillator sounds (more reliable than external URLs)
    const createTone = (
      name: string, 
      id: string, 
      category: SoundCategory, 
      frequencies: number[],
      durations: number[],
      type: OscillatorType = 'sine'
    ): MemeSound => {
      return {
        id,
        name,
        url: `tone:${id}`,
        category,
        howl: new Howl({
          src: ['/sounds/placeholder.mp3'], // This is a workaround - we'll use custom AudioContext instead
          volume: this.globalVolume,
          onplay: () => {
            // Play custom tones using AudioContext when Howl tries to play
            this.playToneSequence(frequencies, durations, type);
          }
        })
      };
    };
    
    const effectsSounds: MemeSound[] = [
      createTone('Beep', 'beep', 'effects', [440], [200]),
      createTone('Double Beep', 'double_beep', 'effects', [440, 440], [100, 100]),
      createTone('Success', 'success', 'effects', [523.25, 659.25, 783.99], [100, 100, 300], 'sine'),
      createTone('Error', 'error', 'effects', [392, 349.23], [200, 300], 'sawtooth'),
      createTone('Click', 'click', 'effects', [1200], [20], 'sine'),
      createTone('Blip', 'blip', 'effects', [880], [50], 'sine'),
      createTone('Alert', 'alert', 'effects', [523.25, 466.16], [120, 200], 'square'),
      createTone('Pop', 'pop', 'effects', [880, 0], [60, 10], 'sine')
    ];
    
    const musicSounds: MemeSound[] = [
      createTone('Happy Tune', 'happy', 'music', 
        [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25], 
        [150, 150, 150, 300, 150, 150, 300], 'sine'),
      createTone('Sad Tune', 'sad', 'music', 
        [392, 349.23, 329.63, 293.66, 261.63], 
        [200, 200, 200, 200, 400], 'sine'),
      createTone('Suspense', 'suspense', 'music', 
        [196, 185.00, 196, 185.00, 196], 
        [200, 200, 200, 200, 400], 'sine')
    ];
    
    const voiceSounds: MemeSound[] = [
      createTone('Robot Voice', 'robot', 'voices', 
        [160, 200, 160], [100, 100, 100], 'square'),
      createTone('Alien Voice', 'alien', 'voices', 
        [300, 250, 280, 230, 300], [80, 80, 80, 80, 80], 'sawtooth')
    ];
    
    // Combine all sound categories
    this.sounds = [...effectsSounds, ...musicSounds, ...voiceSounds];
    
    // Pre-load sounds
    this.sounds.forEach(sound => {
      sound.howl = new Howl({
        src: [sound.url],
        volume: this.globalVolume,
        preload: true,
        html5: true, // For streaming support and better mobile performance
        onload: () => {
          sound.duration = sound.howl?.duration() || 0;
        }
      });
    });
  }
  
  // Get all sounds
  getAllSounds(): MemeSound[] {
    return this.sounds;
  }
  
  // Get sounds by category
  getSoundsByCategory(category: SoundCategory): MemeSound[] {
    return this.sounds.filter(sound => sound.category === category);
  }
  
  // Play a sound by id
  playSound(id: string): void {
    const sound = this.sounds.find(s => s.id === id);
    if (sound?.howl) {
      // Stop any instances of this sound first
      sound.howl.stop();
      
      // Play the sound
      if (!this.isMuted) {
        sound.howl.volume(this.globalVolume);
        sound.howl.play();
      }
    }
  }
  
  // Stop a sound by id
  stopSound(id: string): void {
    const sound = this.sounds.find(s => s.id === id);
    if (sound?.howl) {
      sound.howl.stop();
    }
  }
  
  // Stop all sounds
  stopAllSounds(): void {
    this.sounds.forEach(sound => {
      if (sound.howl) {
        sound.howl.stop();
      }
    });
  }
  
  // Play a sequence of tones using Web Audio API
  playToneSequence(frequencies: number[], durations: number[], type: OscillatorType = 'sine'): void {
    if (this.isMuted) return;
    
    // Create an audio context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Create a gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = this.globalVolume;
    gainNode.connect(audioContext.destination);
    
    // Function to play a single tone
    const playTone = (frequency: number, duration: number, time: number) => {
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      // Connect to gain node
      oscillator.connect(gainNode);
      
      // Schedule playback
      oscillator.start(time);
      oscillator.stop(time + duration / 1000);
    };
    
    // Schedule all tones in sequence
    let currentTime = audioContext.currentTime;
    for (let i = 0; i < frequencies.length; i++) {
      if (frequencies[i] > 0) { // Skip silent tones (frequency=0)
        playTone(frequencies[i], durations[i], currentTime);
      }
      currentTime += durations[i] / 1000;
    }
    
    // Close the audio context after all sounds have played
    setTimeout(() => {
      audioContext.close();
    }, durations.reduce((sum, val) => sum + val, 0) + 100);
  }
  
  // Set global volume (0-1)
  setVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    
    // Update all sounds
    this.sounds.forEach(sound => {
      if (sound.howl) {
        sound.howl.volume(this.globalVolume);
      }
    });
  }
  
  // Get global volume
  getVolume(): number {
    return this.globalVolume;
  }
  
  // Mute/unmute all sounds
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    // Apply to all sounds
    this.sounds.forEach(sound => {
      if (sound.howl) {
        sound.howl.mute(this.isMuted);
      }
    });
  }
  
  // Check if sounds are muted
  isMutedState(): boolean {
    return this.isMuted;
  }
  
  // Add a custom sound
  addCustomSound(name: string, url: string): MemeSound {
    const id = `custom_${Date.now()}`;
    const newSound: MemeSound = {
      id,
      name,
      url,
      category: 'custom',
      howl: new Howl({
        src: [url],
        volume: this.globalVolume,
        html5: true
      })
    };
    
    this.sounds.push(newSound);
    return newSound;
  }
  
  // Remove a custom sound
  removeSound(id: string): boolean {
    const index = this.sounds.findIndex(s => s.id === id);
    if (index >= 0 && this.sounds[index].category === 'custom') {
      // Stop the sound if it's playing
      if (this.sounds[index].howl) {
        this.sounds[index].howl.stop();
      }
      
      // Remove from the array
      this.sounds.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Create and export singleton instance
export const soundLibrary = new SoundLibrary();

// Export sound data for use in the UI
export function getSoundOptions(): MemeSound[] {
  return soundLibrary.getAllSounds();
}