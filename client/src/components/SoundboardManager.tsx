import React, { createContext, useContext, useEffect, useState } from 'react';

// Define sound types
export type SoundType = 
  | 'achievement_earned' 
  | 'victory' 
  | 'battle_start' 
  | 'like' 
  | 'new_comment' 
  | 'challenge_complete'
  | 'button_click'
  | 'error'
  | 'success'
  | 'notification';

// Map of sound types to their file paths
const soundFiles: Record<SoundType, string> = {
  achievement_earned: '/sounds/achievement_earned.mp3',
  victory: '/sounds/victory.mp3',
  battle_start: '/sounds/battle_start.mp3',
  like: '/sounds/like.mp3',
  new_comment: '/sounds/new_comment.mp3',
  challenge_complete: '/sounds/challenge_complete.mp3',
  button_click: '/sounds/button_click.mp3',
  error: '/sounds/error.mp3',
  success: '/sounds/success.mp3',
  notification: '/sounds/notification.mp3'
};

// Volume levels for different sound categories
const volumeLevels: Record<string, number> = {
  achievements: 0.7,
  ui: 0.5,
  notifications: 0.6,
  battles: 0.8
};

// Context for sound manager
interface SoundContextType {
  playSound: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
  setVolume: (category: string, level: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSoundboard = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundboard must be used within a SoundboardProvider');
  }
  return context;
};

// Sound category mapping
const soundCategories: Record<SoundType, string> = {
  achievement_earned: 'achievements',
  victory: 'battles',
  battle_start: 'battles',
  like: 'notifications',
  new_comment: 'notifications',
  challenge_complete: 'achievements',
  button_click: 'ui',
  error: 'ui',
  success: 'ui',
  notification: 'notifications'
};

// Provider component
export const SoundboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    // Load mute preference from localStorage
    const savedMute = localStorage.getItem('soundMuted');
    return savedMute ? JSON.parse(savedMute) : false;
  });
  
  const [volumes, setVolumes] = useState<Record<string, number>>(() => {
    // Load volume preferences from localStorage
    const savedVolumes = localStorage.getItem('soundVolumes');
    return savedVolumes ? JSON.parse(savedVolumes) : volumeLevels;
  });
  
  const [audioElements, setAudioElements] = useState<Record<SoundType, HTMLAudioElement | null>>({
    achievement_earned: null,
    victory: null,
    battle_start: null,
    like: null,
    new_comment: null,
    challenge_complete: null,
    button_click: null,
    error: null,
    success: null,
    notification: null
  });
  
  // Initialize audio elements
  useEffect(() => {
    const elements: Record<SoundType, HTMLAudioElement> = {} as any;
    
    Object.entries(soundFiles).forEach(([type, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      elements[type as SoundType] = audio;
    });
    
    setAudioElements(elements);
    
    // Cleanup
    return () => {
      Object.values(elements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);
  
  // Save preferences to localStorage when changed
  useEffect(() => {
    localStorage.setItem('soundMuted', JSON.stringify(isMuted));
  }, [isMuted]);
  
  useEffect(() => {
    localStorage.setItem('soundVolumes', JSON.stringify(volumes));
  }, [volumes]);
  
  // Play a sound
  const playSound = (type: SoundType) => {
    if (isMuted || !audioElements[type]) return;
    
    const category = soundCategories[type];
    const volume = volumes[category] || 0.5;
    
    // Create a new Audio instance to allow multiple sounds to play simultaneously
    const audio = new Audio(soundFiles[type]);
    audio.volume = volume;
    
    // Handle errors
    audio.onerror = () => {
      console.error(`Error playing sound: ${type}`);
    };
    
    // Play the sound
    audio.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  };
  
  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };
  
  // Set volume for a category
  const setVolume = (category: string, level: number) => {
    setVolumes((prev: Record<string, number>) => ({
      ...prev,
      [category]: Math.max(0, Math.min(1, level))
    }));
  };
  
  return (
    <SoundContext.Provider value={{ playSound, isMuted, toggleMute, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
};

// UI component for controlling sounds
export const SoundboardControls: React.FC = () => {
  const { isMuted, toggleMute, setVolume } = useSoundboard();
  
  return (
    <div className="p-4 bg-card rounded-lg shadow-sm">
      <h3 className="font-medium mb-4">Sound Settings</h3>
      
      <div className="flex items-center justify-between mb-4">
        <span>Sound Effects</span>
        <button
          className={`w-12 h-6 rounded-full transition-colors ${isMuted ? 'bg-gray-300' : 'bg-primary'} relative`}
          onClick={toggleMute}
        >
          <span 
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transform transition-transform ${isMuted ? 'left-1' : 'left-7'}`}
          />
        </button>
      </div>
      
      {!isMuted && (
        <div className="space-y-4">
          <VolumeSlider category="achievements" label="Achievement Sounds" />
          <VolumeSlider category="battles" label="Battle Sounds" />
          <VolumeSlider category="notifications" label="Notification Sounds" />
          <VolumeSlider category="ui" label="UI Sounds" />
        </div>
      )}
    </div>
  );
};

// Helper component for volume control
const VolumeSlider: React.FC<{ category: string; label: string }> = ({ category, label }) => {
  const { setVolume } = useSoundboard();
  const [volume, setVolumeState] = useState(() => {
    const savedVolumes = localStorage.getItem('soundVolumes');
    if (savedVolumes) {
      const volumes = JSON.parse(savedVolumes);
      return volumes[category] || 0.5;
    }
    return volumeLevels[category] || 0.5;
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setVolume(category, newVolume);
  };
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{Math.round(volume * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
    </div>
  );
};

export default SoundboardProvider;