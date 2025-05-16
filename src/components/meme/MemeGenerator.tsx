
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Prompt } from '@/lib/types';
import { getMemeById } from '@/lib/database';
import { uploadMeme } from '@/lib/memeUpload';
import { ArrowLeft, ArrowRight, CheckCircle2, CheckCircle, Copy, CopyCheck, Plus, RefreshCcw, Upload, UploadCloud } from 'lucide-react';
import { tags as defaultTags } from '@/lib/tags';

// Define a type for the tag objects
type Tag = {
  name: string;
  selected: boolean;
};

// Define the template type
type Template = {
  id: string;
  name: string;
  url: string;
  textPositions: { 
    x: number; 
    y: number;
    fontSize?: number;
    maxWidth?: number;
    alignment?: string;
  }[];
};

interface MemeGeneratorProps {
  promptData?: Prompt | null;
  battleId?: string | null;
  memeId?: string | null;
  selectedTemplate?: Template | null;
  generatedImage?: string | null;
}

const MemeGenerator = ({ 
  promptData,
  battleId,
  memeId,
  selectedTemplate,
  generatedImage
}: MemeGeneratorProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Canvas references
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  
  // State variables
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(36);
  const [fontColor, setFontColor] = useState<string>('#FFFFFF');
  const [outlineColor, setOutlineColor] = useState<string>('#000000');
  const [outlineWidth, setOutlineWidth] = useState<number>(2);
  const [isOutlined, setIsOutlined] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // Load generated image if provided
  useEffect(() => {
    if (generatedImage) {
      setImageUrl(generatedImage);
    }
  }, [generatedImage]);
  
  // Load selected template if provided
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.url) {
      setImageUrl(selectedTemplate.url);
    }
  }, [selectedTemplate]);
  
  // Load existing meme if memeId is provided
  useEffect(() => {
    if (memeId) {
      loadExistingMeme(memeId);
    }
  }, [memeId]);
  
  // Load image from localStorage if available
  useEffect(() => {
    if (!imageUrl) {
      const storedImage = localStorage.getItem('meme_image');
      if (storedImage) {
        setImageUrl(storedImage);
      }
    }
  }, [imageUrl]);
  
  // Handle navigation
  const handleBack = () => {
    // Check if the user came from the /create page
    if (location.state && location.state.fromCreate) {
      // Navigate back to the main index page
      navigate('/', { replace: true });
    } else {
      // If not, navigate back to the previous page in history
      navigate(-1);
    }
  };
  
  const loadExistingMeme = async (memeId: string) => {
    try {
      const meme = await getMemeById(memeId);
      if (meme) {
        setImageUrl(meme.imageUrl);
        setCaption(meme.caption);
        setTags(defaultTags.map(tag => ({
          ...tag,
          selected: meme.tags.includes(tag.name)
        })));
      } else {
        toast("Error", {
          description: "Meme not found."
        });
      }
    } catch (error) {
      console.error("Error loading meme:", error);
      toast("Error", {
        description: "Failed to load meme."
      });
    }
  };

  // Canvas drawing function
  const drawTextOnCanvas = () => {
    if (!canvas.current || !image.current || !imageUrl) {
      return;
    }

    const ctx = canvas.current.getContext('2d');
    if (!ctx) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    
    // Draw the image
    ctx.drawImage(image.current, 0, 0, canvas.current.width, canvas.current.height);

    // Set font styles
    ctx.font = `${fontSize}px Impact`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Break caption into lines
    const maxWidth = canvas.current.width - 20;
    const words = caption.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Calculate the starting y position
    let y = canvas.current.height - 10 - (lines.length - 1) * fontSize;

    // Draw the text line by line
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const x = canvas.current.width / 2;

      // Stroke text (outline)
      if (isOutlined) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.strokeText(currentLine, x, y);
      }

      // Fill text
      ctx.fillText(currentLine, x, y);

      // Move to the next line
      y += fontSize;
    }
  };

  // Function to convert base64 data to Blob
  const base64DataToBlob = (base64Data: string, contentType: string): Blob => {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: contentType });
  };

  // Save handler
  const handleSave = async () => {
    if (!canvas.current || !imageUrl || isSubmitting || !user) {
      if (!user) {
        toast("Error", {
          description: "You must be logged in to save a meme."
        });
        return;
      }
      if (!imageUrl) {
        toast("Error", {
          description: "Please add an image first."
        });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting meme save process...');
      
      // Generate the final image as a data URL
      const dataUrl = canvas.current.toDataURL('image/png');
      console.log('Canvas image generated successfully');
      
      // Create file from dataURL
      const blob = base64DataToBlob(dataUrl, 'image/png');
      const file = new File([blob], 'meme.png', { type: 'image/png' });
      console.log('File created from canvas:', file.size, 'bytes');
      
      // Get the meme metadata
      const activeTags = tags.filter(tag => tag.selected).map(tag => tag.name);
      const currentPromptData = promptData || { text: customPrompt, id: null };
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // Create the meme object
      const memeData = {
        prompt: currentPromptData.text || customPrompt || '',
        prompt_id: currentPromptData.id || null,
        caption: caption,
        creatorId: user?.id || '',
        tags: activeTags,
        battleId: battleId || null,
        isBattleSubmission: battleId ? true : false
      };
      
      console.log('Calling uploadMeme with meme data:', memeData);
      
      // Upload the meme
      const result = await uploadMeme(formData, memeData);
      
      if (result.error) {
        console.error('Error from uploadMeme:', result.error);
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to save meme');
      }
      
      console.log("Meme saved successfully", result);
      
      toast("Meme Saved!", {
        description: "Your meme has been successfully saved and published."
      });
      
      // Redirect to user profile page
      if (user) {
        setTimeout(() => {
          navigate(`/profile/${user.id}`);
        }, 1000);
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error("Error saving meme:", error);
      toast("Error", {
        description: `Failed to save meme: ${error.message || "Unknown error"}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag selection
  const handleTagClick = (tagName: string) => {
    setTags(prevTags =>
      prevTags.map(tag =>
        tag.name === tagName ? { ...tag, selected: !tag.selected } : tag
      )
    );
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl)
        .then(() => {
          setIsCopied(true);
          toast("Image URL Copied", {
            description: "The image URL has been copied to your clipboard."
          });
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error("Failed to copy:", err);
          toast("Copy Failed", {
            description: "Failed to copy the image URL to clipboard."
          });
        });
    } else {
      toast("No Image", {
        description: "Please upload an image first."
      });
    }
  };

  // Re-draw the canvas when these states change
  useEffect(() => {
    drawTextOnCanvas();
  }, [imageUrl, caption, fontSize, fontColor, outlineColor, outlineWidth, isOutlined]);

  return (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 md:top-6 md:left-6 z-10"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Canvas and Image Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <div className="relative">
            {/* Canvas */}
            <canvas
              ref={canvas}
              width={500}
              height={500}
              className="border border-muted rounded-md shadow-md"
            />
            
            {/* Hidden Image */}
            <img
              ref={image}
              src={imageUrl || ''}
              alt="Uploaded Meme"
              style={{ display: 'none' }}
              onLoad={drawTextOnCanvas}
              crossOrigin="anonymous"
            />
            
            {/* Image Placeholder */}
            {!imageUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-md">
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Upload an image to start</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Controls Section */}
        <div className="w-full md:w-1/2 p-4 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Meme Generator</h2>
          
          {/* Caption Input */}
          <div className="mb-4">
            <Label htmlFor="caption" className="block text-sm font-medium text-gray-700">
              Caption
            </Label>
            <div className="mt-1">
              <Textarea
                id="caption"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md resize-none"
                placeholder="Enter your meme caption here..."
              />
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Font Size Slider */}
          <div className="mb-4">
            <Label htmlFor="font-size" className="block text-sm font-medium text-gray-700">
              Font Size
            </Label>
            <Slider
              id="font-size"
              defaultValue={[fontSize]}
              max={100}
              min={10}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
              className="mt-2"
            />
          </div>
          
          <Separator className="my-2" />
          
          {/* Font Color Picker */}
          <div className="mb-4">
            <Label htmlFor="font-color" className="block text-sm font-medium text-gray-700">
              Font Color
            </Label>
            <Input
              type="color"
              id="font-color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="mt-1 w-full h-10 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <Separator className="my-2" />
          
          {/* Outline Settings */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="outline" className="block text-sm font-medium text-gray-700">
                Outline
              </Label>
              <Switch
                id="outline"
                checked={isOutlined}
                onCheckedChange={(checked) => setIsOutlined(checked)}
              />
            </div>
            
            {isOutlined && (
              <>
                <div className="mt-2">
                  <Label htmlFor="outline-color" className="block text-sm font-medium text-gray-700">
                    Outline Color
                  </Label>
                  <Input
                    type="color"
                    id="outline-color"
                    value={outlineColor}
                    onChange={(e) => setOutlineColor(e.target.value)}
                    className="mt-1 w-full h-10 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="mt-2">
                  <Label htmlFor="outline-width" className="block text-sm font-medium text-gray-700">
                    Outline Width
                  </Label>
                  <Slider
                    id="outline-width"
                    defaultValue={[outlineWidth]}
                    max={10}
                    min={1}
                    step={1}
                    onValueChange={(value) => setOutlineWidth(value[0])}
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </div>
          
          <Separator className="my-2" />
          
          {/* Tags */}
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700">Tags</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.name}
                  variant={tag.selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Custom Prompt */}
          {promptData === null && (
            <div className="mb-4">
              <Label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">
                Custom Prompt
              </Label>
              <div className="mt-1">
                <Input
                  type="text"
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter a custom prompt..."
                />
              </div>
            </div>
          )}
          
          {/* Save Button */}
          <Button 
            className="bg-brand-purple text-white hover:bg-brand-purple/90 mt-auto"
            onClick={handleSave}
            disabled={isSubmitting || !imageUrl}
          >
            {isSubmitting ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Save Meme
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemeGenerator;
