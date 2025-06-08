import React, { useState, useEffect, useRef } from 'react';
import { availableSounds, SimpleSound, playSound, setVolume, getVolume, setMuted, getMuted } from '@/lib/simpleSoundEffects';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Volume2,
  Play,
  Pause,
  Square,
  VolumeX,
  Volume,
  Upload,
  Plus,
  Trash,
  Mic
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Rename to avoid conflict with imported type
type SoundEffect = LibrarySound;

interface MemeSoundboardProps {
  memeId?: number;
  onAttachSound?: (soundId: string) => void;
  attachedSounds?: string[];
  className?: string;
}

const MemeSoundboard = ({ memeId, onAttachSound, attachedSounds = [], className }: MemeSoundboardProps) => {
  const [sounds, setSounds] = useState<SoundEffect[]>(getSoundOptions());
  const [selectedCategory, setSelectedCategory] = useState<string>("effects");
  const [currentSoundId, setCurrentSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(soundLibrary.isMutedState());
  const [volume, setVolume] = useState([soundLibrary.getVolume()]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingURL, setRecordingURL] = useState<string | null>(null);
  
  // Recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  
  // Filter sounds by category
  const filteredSounds = sounds.filter(sound => 
    selectedCategory === 'all' || sound.category === selectedCategory
  );
  
  // Update volume in sound library when slider changes
  useEffect(() => {
    soundLibrary.setVolume(volume[0]);
  }, [volume]);
  
  // Update mute state in sound library
  useEffect(() => {
    soundLibrary.setMuted(isMuted);
  }, [isMuted]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      soundLibrary.stopAllSounds();
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
    };
  }, []);
  
  // Play a sound
  const playSound = (soundId: string) => {
    // Stop any currently playing sound
    if (currentSoundId) {
      soundLibrary.stopSound(currentSoundId);
    }
    
    // Play the selected sound
    soundLibrary.playSound(soundId);
    setCurrentSoundId(soundId);
    setIsPlaying(true);
    
    // Auto-stop the playing state after the sound duration
    const sound = sounds.find(s => s.id === soundId);
    if (sound?.duration) {
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentSoundId(null);
      }, sound.duration * 1000);
    } else {
      // Fallback duration if not available
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentSoundId(null);
      }, 3000);
    }
  };
  
  // Stop playback
  const stopSound = () => {
    if (currentSoundId) {
      soundLibrary.stopSound(currentSoundId);
      setCurrentSoundId(null);
      setIsPlaying(false);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    soundLibrary.setMuted(newMuteState);
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    soundLibrary.setVolume(newVolume[0]);
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from recorded chunks
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingURL(url);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Reset recording state
        setIsRecording(false);
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        
        toast({
          title: 'Recording complete',
          description: `Recorded ${recordingTime} seconds of audio`
        });
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: 'Recording started',
        description: 'Speak into your microphone to record a sound'
      });
      
      // Automatically stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  // Save recorded sound
  const saveRecording = () => {
    if (recordingURL) {
      const name = `Recorded Sound ${new Date().toLocaleTimeString()}`;
      const newSound = soundLibrary.addCustomSound(name, recordingURL);
      
      // Update the sounds list
      setSounds(getSoundOptions());
      
      // Switch to custom tab
      setSelectedCategory('custom');
      
      toast({
        title: 'Sound saved',
        description: 'Your recording has been added to your custom sounds'
      });
      
      // Reset recording state
      setRecordingURL(null);
    }
  };
  
  // Discard recording
  const discardRecording = () => {
    if (recordingURL) {
      URL.revokeObjectURL(recordingURL);
      setRecordingURL(null);
    }
  };
  
  // Handle sound attachment
  const attachSound = (soundId: string) => {
    if (onAttachSound) {
      onAttachSound(soundId);
      
      toast({
        title: 'Sound attached',
        description: 'Sound effect added to your meme'
      });
    }
  };
  
  // Delete a custom sound
  const deleteCustomSound = (soundId: string) => {
    const result = soundLibrary.removeSound(soundId);
    if (result) {
      setSounds(getSoundOptions());
      toast({
        title: 'Sound deleted',
        description: 'Custom sound has been removed'
      });
    }
  };
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sound Effects</span>
          <div className="flex items-center space-x-2">
            {/* Volume control */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            <Slider 
              className="w-24" 
              value={volume} 
              onValueChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category tabs */}
        <Tabs defaultValue="effects" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="voices">Voices</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Sound grid */}
        <div className="grid grid-cols-2 gap-2">
          {filteredSounds.map(sound => (
            <div key={sound.id} className="relative group">
              <Button 
                variant="outline" 
                className={`w-full justify-between ${currentSoundId === sound.id && isPlaying ? 'bg-primary/10' : ''} ${attachedSounds.includes(sound.id) ? 'ring-1 ring-primary' : ''}`}
                onClick={() => playSound(sound.id)}
              >
                <span className="truncate mr-2">{sound.name}</span>
                {currentSoundId === sound.id && isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} />
                )}
              </Button>
              
              {/* Overlay buttons for playback and attach - fixed positioning */}
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Attach button */}
                {onAttachSound && !attachedSounds.includes(sound.id) && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-background/90 shadow-sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      attachSound(sound.id);
                    }}
                  >
                    <Plus size={12} />
                  </Button>
                )}
                
                {/* Delete button for custom sounds */}
                {sound.category === 'custom' && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-background/90 shadow-sm text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomSound(sound.id);
                    }}
                  >
                    <Trash size={12} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Record new sound UI */}
        <div className="rounded-lg border p-3 mt-4">
          <div className="text-sm font-medium mb-2">Record New Sound</div>
          
          {!recordingURL ? (
            <div className="flex items-center justify-center space-x-2">
              {isRecording ? (
                <>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="h-3 w-3 rounded-full bg-red-500 mr-2"
                  />
                  <span className="text-sm">{formatTime(recordingTime)}</span>
                  <Button 
                    variant="outline" 
                    onClick={stopRecording}
                  >
                    <Square size={16} className="mr-2" />
                    Stop
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={startRecording}
                  className="w-full"
                >
                  <Mic size={16} className="mr-2" />
                  Record Sound
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (recordingURL) {
                      const audio = new Audio(recordingURL);
                      audio.play();
                    }
                  }}
                >
                  <Play size={16} className="mr-2" />
                  Preview
                </Button>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={discardRecording}
                >
                  Discard
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={saveRecording}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {attachedSounds.length > 0 && (
          <div className="w-full">
            <h4 className="text-sm font-medium mb-2">Attached Sounds</h4>
            <div className="flex flex-wrap gap-2">
              {attachedSounds.map(soundId => {
                const sound = sounds.find(s => s.id === soundId);
                return sound ? (
                  <Button 
                    key={soundId}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => playSound(soundId)}
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

export default MemeSoundboard;