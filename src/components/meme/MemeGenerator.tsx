
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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Prompt } from '@/lib/types';
import { getMemeById } from '@/lib/database';
import { uploadMeme } from '@/lib/memeUpload';
import { ArrowLeft, Upload, UploadCloud } from 'lucide-react';
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
  const [validationErrors, setValidationErrors] = useState<{
    image?: string;
  }>({});
  
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
  
  // Load existing meme data
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
        toast("Meme not found");
      }
    } catch (error) {
      console.error("Error loading meme:", error);
      toast("Failed to load meme");
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

    if (caption) {
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

  // Validate input fields
  const validateInputs = (): boolean => {
    const errors: {image?: string} = {};
    
    if (!imageUrl) {
      errors.image = "An image is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save handler
  const handleSave = async () => {
    if (!user) {
      toast("You must be logged in to save a meme");
      return;
    }
    
    // Validate inputs - only check for image
    if (!validateInputs()) {
      if (validationErrors.image) {
        toast.error("Image is required", {
          description: "Please select or generate an image first"
        });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting meme save process...');
      
      // Generate the final image as a data URL
      const dataUrl = canvas.current!.toDataURL('image/png');
      console.log('Canvas image generated successfully');
      
      // Create file from dataURL
      const blob = base64DataToBlob(dataUrl, 'image/png');
      const file = new File([blob], 'meme.png', { type: 'image/png' });
      console.log('File created from canvas:', file.size, 'bytes');
      
      // Get the meme metadata
      const activeTags = tags.filter(tag => tag.selected).map(tag => tag.name);
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // Create the meme object
      const memeData = {
        prompt: promptData?.text || customPrompt || '',
        prompt_id: null, // Set to null to avoid FK issues
        caption: caption, // Caption can be empty
        creatorId: user.id,
        tags: activeTags,
        battleId: null, // Don't send battleId
        isBattleSubmission: false
      };
      
      console.log('Calling uploadMeme with meme data:', memeData);
      
      // Upload the meme
      const result = await uploadMeme(formData, memeData);
      
      if (result.error) {
        console.error('Error from uploadMeme:', result.error);
        toast.error("Failed to save meme", {
          description: result.error
        });
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to save meme');
      }
      
      console.log("Meme saved successfully", result);
      
      toast.success("Meme Saved!", {
        description: "Your meme has been successfully saved and published."
      });
      
      // Clear localStorage
      localStorage.removeItem('meme_image');
      
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
      toast.error("Error saving meme", {
        description: error.message || "Unknown error"
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

  // Re-draw the canvas when these states change
  useEffect(() => {
    drawTextOnCanvas();
  }, [imageUrl, caption, fontSize, fontColor, outlineColor, outlineWidth, isOutlined]);

  // Improved layout based on the provided screenshot
  return (
    <div className="p-4 bg-background rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Meme Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Canvas */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full max-w-md aspect-square">
            <canvas
              ref={canvas}
              width={500}
              height={500}
              className="w-full h-full border border-muted rounded-md shadow-md"
            />
            
            <img
              ref={image}
              src={imageUrl || ''}
              alt="Meme"
              style={{ display: 'none' }}
              onLoad={drawTextOnCanvas}
              crossOrigin="anonymous"
            />
            
            {!imageUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 rounded-md">
                <UploadCloud className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">Upload an image to start</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Controls */}
        <div className="flex flex-col space-y-6">
          {/* Caption Input */}
          <div>
            <Label htmlFor="caption" className="mb-2">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter your meme caption here..."
              className="min-h-[100px]"
            />
          </div>
          
          {/* Size Control */}
          <div>
            <Label htmlFor="font-size" className="mb-2">Size</Label>
            <Slider
              id="font-size"
              value={[fontSize]}
              max={100}
              min={10}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
              className="my-2"
            />
          </div>
          
          {/* Color Control */}
          <div>
            <Label htmlFor="font-color" className="mb-2">Color</Label>
            <Input
              type="color"
              id="font-color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="h-10"
            />
          </div>
          
          {/* Outline Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="outline">Outline</Label>
              <Switch
                id="outline"
                checked={isOutlined}
                onCheckedChange={(checked) => setIsOutlined(checked)}
              />
            </div>
            
            {isOutlined && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="outline-color" className="mb-2">Outline Color</Label>
                  <Input
                    type="color"
                    id="outline-color"
                    value={outlineColor}
                    onChange={(e) => setOutlineColor(e.target.value)}
                    className="h-10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="outline-width" className="mb-2">Outline Width</Label>
                  <Slider
                    id="outline-width"
                    value={[outlineWidth]}
                    max={10}
                    min={1}
                    step={1}
                    onValueChange={(value) => setOutlineWidth(value[0])}
                    className="my-2"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Tags */}
          <div>
            <Label className="mb-2">Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Button
                  key={tag.name}
                  variant={tag.selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagClick(tag.name)}
                  className="rounded-full"
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Save Button */}
          <Button 
            className="w-full bg-purple-500 hover:bg-purple-600 text-white mt-4"
            onClick={handleSave}
            disabled={isSubmitting || !imageUrl}
          >
            {isSubmitting ? "Saving..." : "Save Meme"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemeGenerator;
