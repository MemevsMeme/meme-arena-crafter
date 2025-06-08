import { useSoundboard } from '@/components/SoundboardManager';
import { 
  playSoundEffect, 
  generateAchievementSound, 
  generateVictorySound,
  generateNotificationSound 
} from './soundEffects';

// Hook to play achievement-related sounds
export const useAchievementSounds = () => {
  const { playSound, isMuted } = useSoundboard();
  
  // Play sound when an achievement is earned
  const playAchievementEarnedSound = () => {
    if (isMuted) return;
    
    // Play both the stored and generated sound
    playSound('achievement_earned');
    playSoundEffect(generateAchievementSound, 0.8);
  };
  
  // Play sound when a battle is won
  const playVictorySound = () => {
    if (isMuted) return;
    
    // Play both the stored and generated sound
    playSound('victory');
    playSoundEffect(generateVictorySound, 0.8);
  };
  
  // Play sound for daily challenge complete
  const playChallengeCompleteSound = () => {
    if (isMuted) return;
    
    playSound('challenge_complete');
    // Play a variation of the achievement sound
    playSoundEffect(async () => {
      const buffer = await generateAchievementSound();
      // Add some extra modifications to make it sound different
      // This is a simplified example - in a real app, you might have a separate generator
      return buffer;
    }, 0.7);
  };
  
  // Play notification sound for new achievements or progress
  const playProgressSound = () => {
    if (isMuted) return;
    
    playSound('notification');
    playSoundEffect(generateNotificationSound, 0.6);
  };
  
  return {
    playAchievementEarnedSound,
    playVictorySound,
    playChallengeCompleteSound,
    playProgressSound
  };
};

// This function can be called when an achievement is unlocked
export const triggerAchievementSound = (achievementType: string) => {
  // This approach won't work directly because hooks can only be used in components
  // Instead, we need to use an event-based system
  // For demonstration purposes, we'll dispatch a custom event
  const event = new CustomEvent('achievement-earned', { 
    detail: { type: achievementType } 
  });
  window.dispatchEvent(event);
};

// Example event listener component that could be used in the app
/*
const AchievementSoundListener = () => {
  const { 
    playAchievementEarnedSound, 
    playVictorySound, 
    playChallengeCompleteSound 
  } = useAchievementSounds();
  
  useEffect(() => {
    const handleAchievementEarned = (event: CustomEvent) => {
      const { type } = event.detail;
      
      switch (type) {
        case 'achievement':
          playAchievementEarnedSound();
          break;
        case 'victory':
          playVictorySound();
          break;
        case 'challenge':
          playChallengeCompleteSound();
          break;
        default:
          // Default achievement sound for other types
          playAchievementEarnedSound();
      }
    };
    
    window.addEventListener('achievement-earned', handleAchievementEarned as EventListener);
    
    return () => {
      window.removeEventListener('achievement-earned', handleAchievementEarned as EventListener);
    };
  }, [playAchievementEarnedSound, playVictorySound, playChallengeCompleteSound]);
  
  return null; // This component doesn't render anything
};
*/