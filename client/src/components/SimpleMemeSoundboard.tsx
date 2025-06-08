import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Volume2,
  Play,
  Pause,
  VolumeX,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define sound types
interface SoundEffect {
  id: string;
  name: string;
  category: 'effects' | 'music' | 'voices';
  play: () => void;
}

// Simple sound effects using Web Audio API
const createSoundEffect = (
  id: string,
  name: string,
  category: 'effects' | 'music' | 'voices',
  frequency: number = 440,
  duration: number = 200,
  type: OscillatorType = 'sine'
): SoundEffect => {
  return {
    id,
    name,
    category,
    play: () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.3; // Fixed moderate volume
        
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
  };
};

// Create a variety of sound effects
const soundEffects: SoundEffect[] = [
  createSoundEffect('beep', 'Beep', 'effects', 440, 200),
  createSoundEffect('boop', 'Boop', 'effects', 330, 200),
  createSoundEffect('click', 'Click', 'effects', 1200, 20),
  createSoundEffect('alert', 'Alert', 'effects', 880, 100),
  createSoundEffect('success', 'Success', 'music', 659, 300),
  createSoundEffect('error', 'Error', 'effects', 220, 300, 'sawtooth'),
  createSoundEffect('robot', 'Robot Voice', 'voices', 160, 200, 'square'),
  createSoundEffect('alien', 'Alien Voice', 'voices', 300, 200, 'sawtooth')
];

// Component props
interface SimpleMemeSoundboardProps {
  onAttachSound?: (soundId: string) => void;
  attachedSounds?: string[];
  className?: string;
}

const SimpleMemeSoundboard = ({ onAttachSound, attachedSounds = [], className }: SimpleMemeSoundboardProps) => {
  const [category, setCategory] = useState('effects');
  const [playing, setPlaying] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const { toast } = useToast();
  
  // Filter sounds by category
  const filteredSounds = soundEffects.filter(sound => 
    sound.category === category
  );
  
  // Play a sound effect
  const handlePlaySound = (sound: SoundEffect) => {
    if (!isMuted) {
      sound.play();
      setPlaying(sound.id);
      
      // Reset playing state after a short delay
      setTimeout(() => {
        setPlaying(null);
      }, 500);
    }
  };
  
  // Attach a sound to a meme
  const handleAttachSound = (soundId: string) => {
    if (onAttachSound) {
      onAttachSound(soundId);
      
      toast({
        title: "Sound attached",
        description: "Sound effect added to your meme"
      });
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sound Effects</span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sound Categories */}
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="voices">Voices</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Sound buttons */}
        <div className="grid grid-cols-2 gap-2">
          {filteredSounds.map(sound => (
            <div key={sound.id} className="relative group">
              <Button 
                variant="outline" 
                className={`w-full justify-between ${playing === sound.id ? 'bg-primary/10' : ''} ${attachedSounds.includes(sound.id) ? 'ring-1 ring-primary' : ''}`}
                onClick={() => handlePlaySound(sound)}
              >
                <span className="truncate mr-2">{sound.name}</span>
                {playing === sound.id ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} />
                )}
              </Button>
              
              {/* Attach button */}
              {onAttachSound && !attachedSounds.includes(sound.id) && (
                <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-background/90 shadow-sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAttachSound(sound.id);
                    }}
                  >
                    <Plus size={12} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        {attachedSounds.length > 0 && (
          <div className="w-full">
            <h4 className="text-sm font-medium mb-2">Attached Sounds</h4>
            <div className="flex flex-wrap gap-2">
              {attachedSounds.map(soundId => {
                const sound = soundEffects.find(s => s.id === soundId);
                return sound ? (
                  <Button 
                    key={soundId}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handlePlaySound(sound)}
                  >
                    <Play size={12} />
                    {sound.name}
                  </Button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SimpleMemeSoundboard;