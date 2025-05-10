import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MEME_TEMPLATES, CAPTION_STYLES } from '@/lib/constants';
import { Image as LucideImage, Upload, Wand, Save, AlertCircle, WandSparkles, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { createMeme } from '@/lib/database';
import { generateCaption, analyzeMemeImage } from '@/lib/ai';

interface MemeGeneratorProps {
  promptText?: string;
  promptId?: string;
  onSave?: (meme: { id: string; caption: string; imageUrl: string }) => void;
}

const MemeGenerator = ({ promptText = '', promptId, onSave }: MemeGeneratorProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(MEME_TEMPLATES[0]);
  const [caption, setCaption] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState(CAPTION_STYLES[0].id);
  const [isCreatingMeme, setIsCreatingMeme] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageTags, setImageTags] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a preview when caption or template/image changes
  useEffect(() => {
    if (caption && (selectedTemplate || uploadedImage)) {
      setShowPreview(true);
      renderMemeToCanvas();
    } else {
      setShowPreview(false);
    }
  }, [caption, selectedTemplate, uploadedImage]);

  const handleGenerateCaptions = async () => {
    if (!promptText) {
      toast.error('Please enter a prompt text first');
      return;
    }

    setIsGeneratingCaptions(true);
    
    try {
      // Use the Gemini API to generate captions
      const captions = await generateCaption(promptText, selectedStyle);
      setGeneratedCaptions(captions);
      
      if (captions.length === 0) {
        toast.error('Couldn\'t generate captions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating captions:', error);
      toast.error('Failed to generate captions');
    } finally {
      setIsGeneratingCaptions(false);
    }
  };
  
  const handleAnalyzeImage = async () => {
    const imageUrl = activeTab === 'template' 
      ? selectedTemplate?.url 
      : uploadedImage;
    
    if (!imageUrl) {
      toast.error('Please select or upload an image first');
      return;
    }
    
    setIsAnalyzingImage(true);
    
    try {
      const tags = await analyzeMemeImage(imageUrl);
      setImageTags(tags);
      
      toast.success('Image analyzed successfully', {
        description: `Tags: ${tags.join(', ')}`
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzingImage(false);
    }
  };
  
  const handleSelectCaption = (text: string) => {
    setCaption(text);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderMemeToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Load image
    const img = new window.Image(); // Use window.Image instead of just Image
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Add caption
      const lines = caption.split('\n');
      
      if (activeTab === 'template' && selectedTemplate.textPositions) {
        // Use predefined positions for templates
        selectedTemplate.textPositions.forEach((pos, index) => {
          if (index < lines.length) {
            drawText(
              ctx, 
              lines[index], 
              pos.x / 100 * canvas.width, 
              pos.y / 100 * canvas.height, 
              pos.fontSize, 
              pos.maxWidth
            );
          }
        });
      } else {
        // Default position for uploaded images - center bottom
        const fontSize = Math.max(16, Math.min(canvas.width / 15, 36));
        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        
        lines.forEach((line, index) => {
          drawText(
            ctx,
            line,
            canvas.width / 2,
            canvas.height - totalHeight + index * lineHeight,
            fontSize,
            canvas.width * 0.8
          );
        });
      }
    };
    
    img.src = activeTab === 'template' ? selectedTemplate.url : (uploadedImage as string);
  };
  
  // Helper function to draw text with stroke
  const drawText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    maxWidth: number
  ) => {
    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text stroke
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 8;
    ctx.strokeText(text, x, y, maxWidth);
    
    // Draw text fill
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y, maxWidth);
  };
  
  // Function to save the meme
  const handleSaveMeme = async () => {
    if (!user) {
      toast.error('You must be logged in to create memes');
      return;
    }
    
    if (!caption || (activeTab === 'upload' && !uploadedImage)) {
      toast.error('Please add both image and caption');
      return;
    }
    
    setIsCreatingMeme(true);
    
    try {
      // Ensure canvas is rendered
      renderMemeToCanvas();
      
      // Convert canvas to blob
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not available');
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob from canvas'));
        }, 'image/png');
      });
      
      // Create file from blob
      const fileName = `meme_${Date.now()}.png`;
      const memeFile = new File([blob], fileName, { type: 'image/png' });
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes')
        .upload(`public/${user.id}/${fileName}`, memeFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memes')
        .getPublicUrl(`public/${user.id}/${fileName}`);
      
      // Create meme record in database
      const memeData = await createMeme({
        prompt: promptText,
        prompt_id: promptId, 
        imageUrl: publicUrl,
        caption: caption,
        creatorId: user.id,
        votes: 0,
        createdAt: new Date(),
        // Use AI-generated tags if available, otherwise use default tags
        tags: imageTags.length > 0 ? imageTags : ['funny', 'meme'],
      });
      
      if (!memeData) throw new Error('Failed to create meme record');
      
      toast.success('Meme created successfully!');
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave({
          id: memeData.id,
          caption: memeData.caption,
          imageUrl: memeData.imageUrl
        });
      }
      
      // Reset form
      setCaption('');
      setUploadedImage(null);
      setFile(null);
      setGeneratedCaptions([]);
      setImageTags([]);
      
    } catch (error) {
      console.error('Error creating meme:', error);
      toast.error('Failed to create meme');
    } finally {
      setIsCreatingMeme(false);
    }
  };

  return (
    <div className="bg-background border rounded-xl p-4 shadow-sm">
      <div className="mb-4">
        <Label htmlFor="prompt-text">Prompt</Label>
        <Textarea
          id="prompt-text"
          placeholder="Enter a prompt or use today's challenge..."
          value={promptText}
          className="h-20"
          readOnly={!!promptText}
        />
      </div>
      
      <Tabs defaultValue="template" className="mb-4" onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="template" className="flex-1">
            <LucideImage className="h-4 w-4 mr-2" />
            Template
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="template" className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {MEME_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-brand-purple shadow-md'
                    : 'border-transparent hover:border-muted'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <img
                  src={template.url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="py-4">
          <div className="mb-4">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1.5"
            />
          </div>
          
          {uploadedImage && (
            <div className="aspect-square max-h-64 mx-auto mb-4 rounded-lg overflow-hidden">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={handleGenerateCaptions}
          disabled={isGeneratingCaptions || !promptText}
        >
          <WandSparkles className="h-3.5 w-3.5" />
          {isGeneratingCaptions ? 'Generating...' : 'Generate Caption Ideas'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={handleAnalyzeImage}
          disabled={isAnalyzingImage || (!selectedTemplate && !uploadedImage)}
        >
          <Tag className="h-3.5 w-3.5" />
          {isAnalyzingImage ? 'Analyzing...' : 'Analyze Image'}
        </Button>
      </div>
      
      {imageTags.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-md">
          <Label className="text-xs text-muted-foreground">AI-Generated Tags:</Label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {imageTags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-background text-xs rounded-md border">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="caption">Caption</Label>
        </div>
        
        {generatedCaptions.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mb-3">
            {generatedCaptions.map((captionText, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-2 whitespace-pre-line text-left"
                onClick={() => handleSelectCaption(captionText)}
              >
                {captionText}
              </Button>
            ))}
          </div>
        )}
        
        <Textarea
          id="caption"
          placeholder="Enter caption for your meme..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="h-24"
        />
      </div>
      
      <div className="mb-6">
        <Label className="mb-2 block">Caption Style</Label>
        <div className="flex flex-wrap gap-2">
          {CAPTION_STYLES.map((style) => (
            <Button
              key={style.id}
              variant={selectedStyle === style.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStyle(style.id)}
              className={selectedStyle === style.id ? 'bg-brand-purple' : ''}
            >
              {style.name}
            </Button>
          ))}
        </div>
      </div>
      
      {showPreview && (
        <div className="mb-6">
          <Label className="mb-2 block">Preview</Label>
          <div className="max-h-80 overflow-hidden flex justify-center rounded-lg border">
            <canvas ref={canvasRef} className="max-w-full max-h-80 object-contain" />
          </div>
        </div>
      )}

      {!user && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to create memes
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        className="w-full create-button" 
        size="lg"
        onClick={handleSaveMeme}
        disabled={!caption || (activeTab === 'upload' && !uploadedImage) || isCreatingMeme || !user}
      >
        {isCreatingMeme ? 'Creating Meme...' : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Create Meme
          </>
        )}
      </Button>
    </div>
  );
};

export default MemeGenerator;
