import React, { useEffect } from 'react';
import { useAchievementSounds } from '@/utils/achievementSounds';

// Event interface for TypeScript
interface AchievementEarnedEvent extends CustomEvent {
  detail: {
    type: string;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
}

/**
 * Component that listens for achievement events and plays appropriate sounds
 * This is a non-rendering component that should be included once in the app
 */
const AchievementSoundListener: React.FC = () => {
  const { 
    playAchievementEarnedSound, 
    playVictorySound, 
    playChallengeCompleteSound,
    playProgressSound
  } = useAchievementSounds();
  
  useEffect(() => {
    // Handler for achievement earned events
    const handleAchievementEarned = (event: AchievementEarnedEvent) => {
      const { type, tier } = event.detail;
      
      switch (type) {
        case 'achievement':
          // Play different sounds based on achievement tier
          if (tier === 'gold' || tier === 'platinum') {
            playVictorySound();
          } else {
            playAchievementEarnedSound();
          }
          break;
        case 'victory':
          playVictorySound();
          break;
        case 'challenge_complete':
          playChallengeCompleteSound();
          break;
        case 'progress_update':
          playProgressSound();
          break;
        default:
          // Default achievement sound for other types
          playAchievementEarnedSound();
      }
    };
    
    // Add event listener
    window.addEventListener('achievement-earned', 
      handleAchievementEarned as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('achievement-earned', 
        handleAchievementEarned as EventListener);
    };
  }, [
    playAchievementEarnedSound, 
    playVictorySound, 
    playChallengeCompleteSound,
    playProgressSound
  ]);
  
  // This component doesn't render anything
  return null;
};

/**
 * Helper function to trigger achievement sounds from anywhere in the app
 */
export const triggerAchievementSound = (
  type: string, 
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
) => {
  const event = new CustomEvent('achievement-earned', { 
    detail: { type, tier } 
  });
  window.dispatchEvent(event);
};

export default AchievementSoundListener;