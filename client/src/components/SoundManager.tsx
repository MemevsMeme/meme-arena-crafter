import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Music, Upload, Mic, Trash } from "lucide-react";

// Types for sound effects
export interface MemeSound {
  id: string;
  name: string;
  url: string;
  category: 'effects' | 'music' | 'voices' | 'custom';
  duration?: number;
}

interface SoundManagerProps {
  onSoundAdded?: (sound: MemeSound) => void;
  className?: string;
}

/**
 * SoundManager component for uploading and managing custom sounds
 * This component allows users to upload their own sound effects for use in memes
 */
const SoundManager = ({ onSoundAdded, className }: SoundManagerProps) => {
  const [uploadedSounds, setUploadedSounds] = useState<MemeSound[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [soundName, setSoundName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file",
        description: "Please select an audio file (.mp3, .wav, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("name", soundName || file.name);
      
      // Upload to server
      const response = await fetch("/api/sounds/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload sound");
      }
      
      const data = await response.json();
      
      // Add to local state
      const newSound: MemeSound = {
        id: data.id,
        name: data.name,
        url: data.url,
        category: 'custom',
        duration: data.duration,
      };
      
      setUploadedSounds([...uploadedSounds, newSound]);
      
      // Call onSoundAdded callback if provided
      if (onSoundAdded) {
        onSoundAdded(newSound);
      }
      
      toast({
        title: "Sound uploaded",
        description: `${data.name} has been added to your sound collection`,
      });
      
      // Reset form
      setSoundName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading sound:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Open file picker
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Delete an uploaded sound
  const deleteSound = async (sound: MemeSound) => {
    try {
      const response = await fetch(`/api/sounds/${sound.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete sound");
      }
      
      setUploadedSounds(uploadedSounds.filter(s => s.id !== sound.id));
      
      toast({
        title: "Sound deleted",
        description: `${sound.name} has been removed from your collection`,
      });
    } catch (error) {
      console.error("Error deleting sound:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Sound Manager
        </CardTitle>
        <CardDescription>
          Upload custom sound effects for your memes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Input
              type="text"
              placeholder="Sound name (optional)"
              value={soundName}
              onChange={(e) => setSoundName(e.target.value)}
            />
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="audio/*"
              onChange={handleFileChange}
            />
            
            <Button 
              onClick={triggerFileInput}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Sound
                </>
              )}
            </Button>
          </div>
          
          {uploadedSounds.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Your Uploaded Sounds</h3>
              <div className="space-y-2">
                {uploadedSounds.map((sound) => (
                  <div key={sound.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <Music className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium">{sound.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteSound(sound)}
                    >
                      <Trash className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <Mic className="mr-2 h-4 w-4" />
          Record New Sound
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SoundManager;