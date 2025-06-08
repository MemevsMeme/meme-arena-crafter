import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemeSoundPlayerProps {
  soundUrl: string;
  className?: string;
}

/**
 * Component for playing sound effects attached to memes
 */
const MemeSoundPlayer = ({ soundUrl, className }: MemeSoundPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isError, setIsError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element when component mounts
    audioRef.current = new Audio(soundUrl);
    
    // Add event listeners
    audioRef.current.addEventListener('ended', handleSoundEnded);
    audioRef.current.addEventListener('error', handleSoundError);
    
    // Clean up when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleSoundEnded);
        audioRef.current.removeEventListener('error', handleSoundError);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl]);

  const handleSoundEnded = () => {
    setIsPlaying(false);
  };

  const handleSoundError = (e: Event) => {
    console.error("Error playing sound:", e);
    setIsError(true);
    setIsPlaying(false);
  };

  const toggleSound = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      // Try to play and handle any errors
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error playing sound:", soundUrl, err);
          setIsError(true);
        });
    }
  };

  if (isError) {
    return null; // Don't show sound button if there was an error loading the sound
  }

  return (
    <Button 
      size="sm"
      variant="secondary"
      className={`rounded-full flex items-center justify-center p-2 bg-white bg-opacity-80 hover:bg-opacity-100 ${className}`}
      onClick={toggleSound}
    >
      {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </Button>
  );
};

export default MemeSoundPlayer;