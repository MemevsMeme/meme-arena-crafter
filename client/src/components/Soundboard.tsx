import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Music, 
  Trophy, 
  Bell, 
  Zap, 
  RotateCcw,
  Star
} from 'lucide-react';
import { useSoundboard } from './SoundboardManager';
import {
  playSoundEffect,
  generateAchievementSound,
  generateVictorySound,
  generateClickSound,
  generateNotificationSound,
  generateErrorSound,
  initAudioContext
} from '@/utils/soundEffects';

// Volume slider component
const VolumeControl: React.FC<{
  label: string;
  category: string;
  icon?: React.ReactNode;
}> = ({ label, category, icon }) => {
  const { setVolume } = useSoundboard();
  const [value, setValue] = useState(() => {
    const savedVolumes = localStorage.getItem('soundVolumes');
    if (savedVolumes) {
      const volumes = JSON.parse(savedVolumes);
      return volumes[category] !== undefined ? [volumes[category] * 100] : [70];
    }
    return [70]; // Default value
  });

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue);
    setVolume(category, newValue[0] / 100);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{value[0]}%</span>
      </div>
      <Slider
        value={value}
        min={0}
        max={100}
        step={5}
        onValueChange={handleValueChange}
      />
    </div>
  );
};

// Soundboard component
const Soundboard: React.FC = () => {
  const { isMuted, toggleMute, playSound } = useSoundboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('sounds');

  // Initialize audio context on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudioContext();
      // Remove the event listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Define sound buttons
  const soundButtons = [
    {
      name: 'Achievement',
      icon: <Trophy size={16} />,
      type: 'achievement_earned' as const,
      color: 'bg-amber-500',
      playFn: generateAchievementSound
    },
    {
      name: 'Victory',
      icon: <Star size={16} />,
      type: 'victory' as const,
      color: 'bg-purple-500',
      playFn: generateVictorySound
    },
    {
      name: 'Click',
      icon: <Zap size={16} />,
      type: 'button_click' as const,
      color: 'bg-blue-500',
      playFn: generateClickSound
    },
    {
      name: 'Notification',
      icon: <Bell size={16} />,
      type: 'notification' as const,
      color: 'bg-green-500',
      playFn: generateNotificationSound
    },
    {
      name: 'Error',
      icon: <RotateCcw size={16} />,
      type: 'error' as const,
      color: 'bg-red-500',
      playFn: generateErrorSound
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`h-12 w-12 rounded-full ${isMuted ? 'bg-gray-300' : 'bg-primary'} text-white flex items-center justify-center shadow-lg`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isMuted ? <VolumeX /> : <Volume2 />}
      </motion.button>

      {/* Expanded soundboard */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-80"
          >
            <Card className="shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Music className="mr-2" />
                  Soundboard
                </CardTitle>
                <CardDescription>Customize your audio experience</CardDescription>
              </CardHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="px-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sounds">Sound Library</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                </div>

                <CardContent className="pt-4">
                  <TabsContent value="sounds" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {soundButtons.map((sound) => (
                        <Button
                          key={sound.name}
                          variant="outline"
                          className="h-auto py-4 flex flex-col items-center gap-2"
                          disabled={isMuted}
                          onClick={() => {
                            playSound(sound.type);
                            playSoundEffect(sound.playFn);
                          }}
                        >
                          <div className={`${sound.color} p-2 rounded-full text-white`}>
                            {sound.icon}
                          </div>
                          <span className="text-xs">{sound.name}</span>
                        </Button>
                      ))}
                    </div>

                    <Separator />

                    <div className="text-sm text-muted-foreground">
                      <p>Custom synthesized sounds that play when you earn achievements or interact with the app.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        <span className="text-sm font-medium">Sound Effects</span>
                      </div>
                      <Switch checked={!isMuted} onCheckedChange={() => toggleMute()} />
                    </div>

                    {!isMuted && (
                      <div className="space-y-4 pt-2">
                        <VolumeControl
                          label="Achievement Sounds"
                          category="achievements"
                          icon={<Trophy size={14} className="text-amber-500" />}
                        />
                        <VolumeControl
                          label="UI Sounds"
                          category="ui"
                          icon={<Zap size={14} className="text-blue-500" />}
                        />
                        <VolumeControl
                          label="Notification Sounds"
                          category="notifications"
                          icon={<Bell size={14} className="text-green-500" />}
                        />
                        <VolumeControl
                          label="Battle Sounds"
                          category="battles"
                          icon={<Star size={14} className="text-purple-500" />}
                        />
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>

              <CardFooter className="justify-between">
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                  Close
                </Button>
                <Badge variant="outline">
                  Procedurally Generated Sounds
                </Badge>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Soundboard;