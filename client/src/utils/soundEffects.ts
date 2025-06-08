/**
 * Sound Effects Utility
 * Creates and exports custom sound effects using the Web Audio API
 */

// Create an audio context 
let audioContext: AudioContext | null = null;

// Initialize the audio context (must be called after user interaction)
export const initAudioContext = () => {
  if (audioContext === null) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate and export sounds to disk (used during development)
export const exportSound = (buffer: AudioBuffer, filename: string) => {
  const audioData = buffer.getChannelData(0);
  const wav = audioBufferToWav(buffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
};

// Convert AudioBuffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  // Create the buffer
  const dataLength = buffer.length * numChannels * bytesPerSample;
  const wavHeader = new ArrayBuffer(44);
  const wavView = new DataView(wavHeader);
  
  // Populate the header
  writeString(wavView, 0, 'RIFF');
  wavView.setUint32(4, 36 + dataLength, true);
  writeString(wavView, 8, 'WAVE');
  writeString(wavView, 12, 'fmt ');
  wavView.setUint32(16, 16, true);
  wavView.setUint16(20, format, true);
  wavView.setUint16(22, numChannels, true);
  wavView.setUint32(24, sampleRate, true);
  wavView.setUint32(28, sampleRate * blockAlign, true);
  wavView.setUint16(32, blockAlign, true);
  wavView.setUint16(34, bitDepth, true);
  writeString(wavView, 36, 'data');
  wavView.setUint32(40, dataLength, true);
  
  // Create the output array buffer
  const outputBuffer = new ArrayBuffer(wavHeader.byteLength + dataLength);
  const outputView = new DataView(outputBuffer);
  
  // Copy the header
  new Uint8Array(outputBuffer).set(new Uint8Array(wavHeader));
  
  // Convert and copy audio data
  const offset = wavHeader.byteLength;
  let position = offset;
  
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      outputView.setInt16(position, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      position += bytesPerSample;
    }
  }
  
  return outputBuffer;
};

// Helper to write strings to DataView
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Sound Generators
// ----------------

// Generate achievement earn sound
export const generateAchievementSound = async (): Promise<AudioBuffer> => {
  const ctx = initAudioContext();
  if (!ctx) throw new Error('Audio context not initialized');
  
  const duration = 1.2;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Sparkle sound with rising tone
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    
    // Base tone (rising)
    const baseFreq = 220 + (1200 * t);
    const baseTone = Math.sin(2 * Math.PI * baseFreq * t);
    
    // Harmonic
    const harmFreq = baseFreq * 1.5;
    const harmTone = Math.sin(2 * Math.PI * harmFreq * t);
    
    // Sparkle effect (random high frequencies)
    const sparkleFreq = 2000 + 1000 * Math.sin(20 * t);
    const sparkle = Math.sin(2 * Math.PI * sparkleFreq * t);
    
    // Envelope to shape the sound
    let envelope = 0;
    if (t < 0.1) {
      envelope = t / 0.1; // Attack
    } else if (t < 0.5) {
      envelope = 1.0; // Sustain
    } else {
      envelope = (1.0 - ((t - 0.5) / 0.7)); // Release
    }
    
    // Sparkling effect increases toward the end
    const sparkleAmount = Math.min(1, t * 2);
    
    // Mix the sounds
    data[i] = envelope * (
      (baseTone * 0.5) + 
      (harmTone * 0.3) + 
      (sparkle * 0.2 * sparkleAmount)
    );
  }
  
  return buffer;
};

// Generate victory sound
export const generateVictorySound = async (): Promise<AudioBuffer> => {
  const ctx = initAudioContext();
  if (!ctx) throw new Error('Audio context not initialized');
  
  const duration = 2.0;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Fanfare pattern
  const notes = [330, 392, 523, 660, 784];
  const noteDuration = 0.15;
  
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    
    // Determine which note to play
    const noteIndex = Math.min(Math.floor(t / noteDuration), notes.length - 1);
    const noteFreq = notes[noteIndex];
    
    // Calculate time within current note
    const noteTime = t - (noteIndex * noteDuration);
    
    // Basic tone
    const mainTone = Math.sin(2 * Math.PI * noteFreq * t);
    
    // Add harmonics
    const harmonic1 = Math.sin(2 * Math.PI * noteFreq * 2 * t) * 0.3;
    const harmonic2 = Math.sin(2 * Math.PI * noteFreq * 3 * t) * 0.2;
    
    // Note envelope
    let envelope = 1.0;
    if (noteTime < 0.02) {
      envelope = noteTime / 0.02; // Quick attack
    } else if (noteTime > (noteDuration - 0.05)) {
      envelope = (noteDuration - noteTime) / 0.05; // Quick release
    }
    
    // Overall sound envelope
    let overallEnvelope = 1.0;
    if (t < 0.1) {
      overallEnvelope = t / 0.1; // Overall attack
    } else if (t > (duration - 0.3)) {
      overallEnvelope = (duration - t) / 0.3; // Overall release
    }
    
    // Mix the sounds with envelopes
    data[i] = overallEnvelope * envelope * (mainTone + harmonic1 + harmonic2);
  }
  
  // Add a triumphant reverb-like effect
  const smoothed = new Float32Array(buffer.length);
  const decay = 0.99;
  let reverb = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    reverb = (reverb * decay) + (data[i] * 0.5);
    smoothed[i] = data[i] + reverb * 0.3;
  }
  
  // Copy back to the buffer
  for (let i = 0; i < buffer.length; i++) {
    data[i] = Math.max(-1, Math.min(1, smoothed[i] * 0.8));
  }
  
  return buffer;
};

// Generate UI click sound
export const generateClickSound = async (): Promise<AudioBuffer> => {
  const ctx = initAudioContext();
  if (!ctx) throw new Error('Audio context not initialized');
  
  const duration = 0.15;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    
    // Crisp click with quick decay
    const freq = 2000 - (1800 * t / duration);
    const click = Math.sin(2 * Math.PI * freq * t);
    
    // Very quick envelope
    let envelope = 0;
    if (t < 0.01) {
      envelope = t / 0.01; // Fast attack
    } else {
      envelope = 1.0 - ((t - 0.01) / (duration - 0.01)); // Decay
    }
    
    // Apply envelope to click
    data[i] = click * envelope * envelope; // Square the envelope for faster decay
  }
  
  return buffer;
};

// Generate notification sound
export const generateNotificationSound = async (): Promise<AudioBuffer> => {
  const ctx = initAudioContext();
  if (!ctx) throw new Error('Audio context not initialized');
  
  const duration = 0.5;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Two-tone notification
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    
    let tone;
    if (t < 0.25) {
      // First tone
      const freq1 = 880;
      tone = Math.sin(2 * Math.PI * freq1 * t);
    } else {
      // Second tone (higher)
      const freq2 = 1320;
      tone = Math.sin(2 * Math.PI * freq2 * t);
    }
    
    // Harmonics
    const harmonic = Math.sin(2 * Math.PI * (t < 0.25 ? 1760 : 2640) * t) * 0.3;
    
    // Envelope for each tone
    let envelope;
    if (t < 0.25) {
      // First tone envelope
      if (t < 0.02) {
        envelope = t / 0.02; // Attack
      } else if (t > 0.22) {
        envelope = (0.25 - t) / 0.03; // Release
      } else {
        envelope = 1.0;
      }
    } else {
      // Second tone envelope
      const t2 = t - 0.25;
      if (t2 < 0.02) {
        envelope = t2 / 0.02; // Attack
      } else if (t2 > 0.22) {
        envelope = (0.25 - t2) / 0.03; // Release
      } else {
        envelope = 1.0;
      }
    }
    
    // Mix tones with envelope
    data[i] = envelope * (tone * 0.7 + harmonic * 0.3);
  }
  
  return buffer;
};

// Generate error sound
export const generateErrorSound = async (): Promise<AudioBuffer> => {
  const ctx = initAudioContext();
  if (!ctx) throw new Error('Audio context not initialized');
  
  const duration = 0.6;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Descending "error" tone
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    
    // Downward sweep
    const freq = 400 - (200 * (t / duration));
    const tone = Math.sin(2 * Math.PI * freq * t);
    
    // Add dissonance
    const dissonance = Math.sin(2 * Math.PI * (freq * 1.1) * t) * 0.3;
    
    // Envelope
    let envelope;
    if (t < 0.05) {
      envelope = t / 0.05; // Attack
    } else if (t > (duration - 0.1)) {
      envelope = (duration - t) / 0.1; // Release
    } else {
      envelope = 1.0;
    }
    
    // Apply subtle wobble
    const wobble = 1 + (0.1 * Math.sin(2 * Math.PI * 10 * t));
    
    // Mix tones with envelope and wobble
    data[i] = envelope * wobble * (tone * 0.7 + dissonance);
  }
  
  return buffer;
};

// Generate all sounds and export them
export const generateAllSounds = async () => {
  const sounds = {
    achievement_earned: await generateAchievementSound(),
    victory: await generateVictorySound(),
    button_click: await generateClickSound(),
    notification: await generateNotificationSound(),
    error: await generateErrorSound()
  };
  
  // Export each sound
  Object.entries(sounds).forEach(([name, buffer]) => {
    exportSound(buffer, `${name}.wav`);
  });
  
  return sounds;
};

// Play a generated sound immediately
export const playSoundEffect = async (generateFn: () => Promise<AudioBuffer>, volume = 0.7) => {
  const ctx = initAudioContext();
  if (!ctx) throw new Error('Audio context not initialized');
  
  // Resume context if suspended (browsers require user interaction)
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  
  // Generate the sound
  const buffer = await generateFn();
  
  // Create source and gain nodes
  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();
  
  // Set up and connect nodes
  source.buffer = buffer;
  gainNode.gain.value = volume;
  
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  // Play the sound
  source.start();
  
  return source;
};