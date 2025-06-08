import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define very simple sound effects
const SOUNDS = [
  { id: 'beep', name: 'Beep', frequency: 440, duration: 200 },
  { id: 'boop', name: 'Boop', frequency: 330, duration: 200 },
  { id: 'click', name: 'Click', frequency: 1200, duration: 30 },
  { id: 'success', name: 'Success', frequency: 660, duration: 300 },
  { id: 'error', name: 'Error', frequency: 220, duration: 300 }
];

interface BasicSoundboardProps {
  onAttachSound?: (soundId: string) => void;
  attachedSounds?: string[];
  className?: string;
}

// Very basic sound player that uses Web Audio API directly
const playBasicSound = (frequency: number, duration: number) => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Create gain node
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1; // Very quiet to avoid being too annoying
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Schedule playback
    oscillator.start();
    
    // Stop after duration
    setTimeout(() => {
      oscillator.stop();
      // Close context to clean up
      setTimeout(() => audioContext.close(), 100);
    }, duration);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

const BasicSoundboard = ({ onAttachSound, attachedSounds = [], className }: BasicSoundboardProps) => {
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Play a sound and update UI
  const handlePlay = (sound: { id: string, frequency: number, duration: number }) => {
    playBasicSound(sound.frequency, sound.duration);
    setPlayingSound(sound.id);
    
    // Reset UI after sound ends
    setTimeout(() => {
      setPlayingSound(null);
    }, sound.duration + 100);
  };
  
  // Attach a sound to the meme
  const handleAttach = (soundId: string) => {
    if (onAttachSound) {
      onAttachSound(soundId);
      toast({
        title: 'Sound attached',
        description: 'Sound effect added to your meme'
      });
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Simple Sound Effects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {SOUNDS.map(sound => (
            <div key={sound.id} className="relative group">
              <Button 
                variant="outline"
                className={`w-full ${playingSound === sound.id ? 'bg-primary/10' : ''} ${attachedSounds?.includes(sound.id) ? 'ring-1 ring-primary' : ''}`}
                onClick={() => handlePlay(sound)}
              >
                {sound.name}
              </Button>
              
              {onAttachSound && !attachedSounds?.includes(sound.id) && (
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAttach(sound.id);
                  }}
                >
                  <Plus size={12} />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {attachedSounds && attachedSounds.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Attached Sounds</h4>
            <div className="flex flex-wrap gap-2">
              {attachedSounds.map(id => {
                const sound = SOUNDS.find(s => s.id === id);
                if (!sound) return null;
                
                return (
                  <Button
                    key={id}
                    size="sm"
                    variant="secondary"
                    onClick={() => handlePlay(sound)}
                    className="flex items-center gap-1"
                  >
                    <Play size={12} />
                    {sound.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicSoundboard;