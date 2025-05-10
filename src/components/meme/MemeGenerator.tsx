
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MEME_TEMPLATES, CAPTION_STYLES } from '@/lib/constants';
import { Image as LucideImage, Upload, Wand, Save, AlertCircle, WandSparkles, Tag, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { createMeme } from '@/lib/database';
import { generateCaption, analyzeMemeImage, generateMemeImage } from '@/lib/ai';
import { uploadFileToIPFS } from '@/lib/ipfs';

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
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [isGeneratingAIImage, setIsGeneratingAIImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a preview when caption or template/image changes
  useEffect(() => {
    if (caption && (selectedTemplate || uploadedImage || generatedImage)) {
      setShowPreview(true);
      renderMemeToCanvas();
    } else {
      setShowPreview(false);
    }
  }, [caption, selectedTemplate, uploadedImage, generatedImage]);

  const handleGenerateCaptions = async () => {
    if (!promptText) {
      toast({
        title: "Error",
        description: "Please enter a prompt text first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingCaptions(true);
    
    try {
      // Use the Gemini API to generate captions
      const captions = await generateCaption(promptText, selectedStyle);
      setGeneratedCaptions(captions);
      
      if (captions.length === 0) {
        toast({
          title: "Error",
          description: "Couldn't generate captions. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating captions:', error);
      toast({
        title: "Error",
        description: "Failed to generate captions",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!promptText) {
      toast({
        title: "Error",
        description: "Please enter a prompt text first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAIImage(true);
    setActiveTab('ai-generated');
    
    try {
      // Use the Gemini API to generate an image
      const imageData = await generateMemeImage(promptText, selectedStyle);
      
      if (imageData) {
        setGeneratedImage(imageData);
        toast({
          title: "Success",
          description: "AI image generated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Couldn't generate image. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAIImage(false);
    }
  };
  
  const handleAnalyzeImage = async () => {
    const imageUrl = activeTab === 'template' 
      ? selectedTemplate?.url 
      : (activeTab === 'ai-generated' ? generatedImage : uploadedImage);
    
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please select or upload an image first",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzingImage(true);
    
    try {
      const tags = await analyzeMemeImage(imageUrl);
      setImageTags(tags);
      
      toast({
        title: "Success",
        description: `Image analyzed successfully. Tags: ${tags.join(', ')}`,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Error",
        description: "Failed to analyze image",
        variant: "destructive"
      });
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
    const img = new window.Image();
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
        // Default position for uploaded/generated images - center bottom
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
    
    let imageSrc = '';
    if (activeTab === 'template') {
      imageSrc = selectedTemplate.url;
    } else if (activeTab === 'upload') {
      imageSrc = uploadedImage as string;
    } else if (activeTab === 'ai-generated') {
      imageSrc = generatedImage as string;
    }
    
    img.src = imageSrc;
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
  
  // Helper function to convert a data URL to a File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };
  
  // Function to save the meme
  const handleSaveMeme = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create memes",
        variant: "destructive"
      });
      return;
    }
    
    if (!caption || (!activeTab.includes('template') && !uploadedImage && !generatedImage)) {
      toast({
        title: "Error",
        description: "Please add both image and caption",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingMeme(true);
    
    try {
      console.log('Starting meme creation process...');
      console.log('User ID:', user.id);
      
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
      
      console.log('Uploading to Supabase storage...');
      
      // Check if 'memes' bucket exists, if not try to create it
      const { data: bucketData } = await supabase.storage.listBuckets();
      const memesBucketExists = bucketData?.some(bucket => bucket.name === 'memes');
      
      if (!memesBucketExists) {
        console.log('Memes bucket does not exist, attempting to use a different bucket');
        // Try using the default public bucket instead
        const { data: buckets } = await supabase.storage.listBuckets();
        console.log('Available buckets:', buckets);
      }
      
      // Upload to Supabase storage with public access
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes')
        .upload(`public/${user.id}/${fileName}`, memeFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png'
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Storage upload successful:', uploadData);
      
      // Get public URL - make sure to use the correct path
      const { data: { publicUrl } } = supabase.storage
        .from('memes')
        .getPublicUrl(`public/${user.id}/${fileName}`);
      
      console.log('Meme public URL:', publicUrl);
      
      // Also upload to IPFS for permanent storage
      setIsUploadingToIPFS(true);
      const memeTitle = caption.substring(0, 30) + '...';
      const ipfsResult = await uploadFileToIPFS(memeFile, `Meme: ${memeTitle}`);
      setIsUploadingToIPFS(false);
      
      const ipfsCid = ipfsResult.success ? ipfsResult.ipfsHash : undefined;
      
      console.log('IPFS upload result:', ipfsResult);
      
      // Create meme record in database with absolute URL
      console.log('Saving meme to database with creator_id:', user.id);
      const memeData = await createMeme({
        prompt: promptText,
        prompt_id: promptId, 
        imageUrl: publicUrl,
        ipfsCid: ipfsCid,
        caption: caption,
        creatorId: user.id,
        votes: 0,
        createdAt: new Date(),
        // Use AI-generated tags if available, otherwise use default tags
        tags: imageTags.length > 0 ? imageTags : ['funny', 'meme'],
      });
      
      if (!memeData) {
        console.error('Failed to create meme record in database');
        throw new Error('Failed to create meme record');
      }
      
      console.log('Meme successfully saved to database:', memeData);
      
      if (ipfsResult.success) {
        toast({
          title: "Success",
          description: `Meme created successfully and stored on IPFS! Your meme is permanently available at: ${ipfsResult.gatewayUrl}`,
        });
      } else {
        toast({
          title: "Success",
          description: "Meme created successfully! Note: IPFS backup failed, but meme was saved to our server.",
        });
      }
      
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
      setGeneratedImage(null);
      setGeneratedCaptions([]);
      setImageTags([]);
      
    } catch (error) {
      console.error('Error creating meme:', error);
      toast({
        title: "Error",
        description: "Failed to create meme: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive"
      });
    } finally {
      setIsCreatingMeme(false);
      setIsUploadingToIPFS(false);
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
          <TabsTrigger value="ai-generated" className="flex-1">
            <Wand className="h-4 w-4 mr-2" />
            AI Image
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

        <TabsContent value="ai-generated" className="py-4">
          <div className="mb-4">
            <Button 
              onClick={handleGenerateImage} 
              disabled={isGeneratingAIImage || !promptText}
              className="w-full"
            >
              {isGeneratingAIImage ? 'Generating Image...' : 'Generate AI Image from Prompt'}
              <Wand className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {isGeneratingAIImage && (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
              <p className="mt-4 text-sm text-muted-foreground">Creating your meme image...</p>
            </div>
          )}
          
          {generatedImage && (
            <div className="aspect-square max-h-64 mx-auto mb-4 rounded-lg overflow-hidden">
              <img
                src={generatedImage}
                alt="AI Generated"
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
          disabled={isAnalyzingImage || (!selectedTemplate && !uploadedImage && !generatedImage)}
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
        disabled={!caption || (activeTab === 'upload' && !uploadedImage && !generatedImage) || isCreatingMeme || !user}
      >
        {isCreatingMeme ? (
          isUploadingToIPFS ? 'Storing on IPFS...' : 'Creating Meme...'
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Create Meme with IPFS Backup
          </>
        )}
      </Button>
    </div>
  );
};

export default MemeGenerator;
