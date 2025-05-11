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
import { generateCaption, analyzeMemeImage, generateMemeImage, isAnimatedGif } from '@/lib/ai';
import { uploadFileToIPFS } from '@/lib/ipfs';
import TextEditor, { TextPosition } from './TextEditor';
import TemplateSelector from './TemplateSelector';
import ImageUploader from './ImageUploader';
import AiImageGenerator from './AiImageGenerator';
import CaptionGenerator from './CaptionGenerator';
import ImageAnalyzer from './ImageAnalyzer';
import SaveActions from './SaveActions';
import MemeCanvas from './MemeCanvas';

interface MemeGeneratorProps {
  promptText?: string;
  promptId?: string;
  onSave?: (meme: { id: string; caption: string; imageUrl: string }) => void;
  defaultEditMode?: boolean;
}

const MemeGenerator = ({ promptText = '', promptId, onSave, defaultEditMode = false }: MemeGeneratorProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(MEME_TEMPLATES[0]);
  const [caption, setCaption] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isGif, setIsGif] = useState(false);
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
  const [isEditMode, setIsEditMode] = useState(defaultEditMode);
  const [textPositions, setTextPositions] = useState<TextPosition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [canvasSize, setCanvasSize] = useState<{width: number, height: number}>({width: 0, height: 0});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a preview when caption or template/image changes
  useEffect(() => {
    if ((caption || textPositions.length > 0) && (selectedTemplate || uploadedImage || generatedImage)) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [caption, selectedTemplate, uploadedImage, generatedImage, textPositions]);

  // Initialize text positions from template
  useEffect(() => {
    if (activeTab === 'template' && selectedTemplate) {
      // Convert template positions to text positions
      const initialPositions = selectedTemplate.textPositions.map((pos: any, index: number) => ({
        text: index === 0 ? caption : '',  // Only set caption for the first position
        x: pos.x,
        y: pos.y,
        fontSize: pos.fontSize,
        maxWidth: pos.maxWidth,
        alignment: 'center' as const,
        color: '#ffffff',
      }));
      
      setTextPositions(initialPositions);
    } else if ((activeTab === 'upload' || activeTab === 'ai-generated') && (uploadedImage || generatedImage)) {
      // For custom uploads, start with one centered text element if none exist
      if (textPositions.length === 0) {
        setTextPositions([
          {
            text: caption || 'Your text here',
            x: 50,
            y: 50,
            fontSize: 32,
            maxWidth: 300,
            alignment: 'center',
            color: '#ffffff',
          }
        ]);
      } else if (caption && textPositions.length > 0 && !textPositions[0].text) {
        // Update first text element with caption if it exists
        const updatedPositions = [...textPositions];
        updatedPositions[0] = {...updatedPositions[0], text: caption};
        setTextPositions(updatedPositions);
      }
    }
  }, [activeTab, selectedTemplate, uploadedImage, generatedImage, caption]);

  // Update caption when first text position changes
  useEffect(() => {
    if (textPositions.length > 0 && textPositions[0].text && textPositions[0].text !== caption) {
      setCaption(textPositions[0].text);
    }
  }, [textPositions]);

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
        description: "Failed to generate image. API may be temporarily unavailable.",
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
    
    // Also update the first text position if in edit mode
    if (textPositions.length > 0) {
      const updatedPositions = [...textPositions];
      updatedPositions[0] = { ...updatedPositions[0], text };
      setTextPositions(updatedPositions);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      
      // Check if it's an animated GIF
      if (file.type === 'image/gif') {
        const animated = await isAnimatedGif(file);
        setIsGif(animated);
        console.log(`File is ${animated ? 'an animated' : 'a static'} GIF`);
      } else {
        setIsGif(false);
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTextElement = () => {
    const newPosition: TextPosition = {
      text: '',
      x: 50,
      y: 50,
      fontSize: 24,
      maxWidth: 200,
      alignment: 'center',
      color: '#ffffff',
    };
    
    setTextPositions([...textPositions, newPosition]);
  };

  const handleRemoveTextElement = (index: number) => {
    const updated = textPositions.filter((_, i) => i !== index);
    setTextPositions(updated);
  };

  const handleTextPositionsChange = (positions: TextPosition[]) => {
    console.log("Text positions updated:", positions);
    setTextPositions(positions);
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
    
    // Check if we have an image but don't require caption
    if ((!activeTab.includes('template') && !uploadedImage && !generatedImage)) {
      toast({
        title: "Error",
        description: "Please select or generate an image first",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingMeme(true);
    
    try {
      console.log('Starting meme creation process...');
      console.log('User ID:', user.id);
      
      let memeFile: File;
      let fileName: string;
      
      // For animated GIFs, we don't render to canvas, we use the original file
      if (isGif && file) {
        fileName = `meme_${Date.now()}.gif`;
        memeFile = new File([file], fileName, { type: 'image/gif' });
      } else {
        // For static images, render the meme on canvas
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not available');
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob from canvas'));
          }, 'image/png');
        });
        
        // Create file from blob
        fileName = `meme_${Date.now()}.png`;
        memeFile = new File([blob], fileName, { type: 'image/png' });
      }
      
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
          contentType: isGif ? 'image/gif' : 'image/png'
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
      
      // Safely get a meme title with null checks
      const memeTitle = isEditMode && textPositions.length > 0 && textPositions[0].text
        ? (textPositions[0].text.substring(0, 30) || 'Untitled') + '...'
        : (caption ? (caption.substring(0, 30) + '...') : 'Untitled Meme');
      
      const ipfsResult = await uploadFileToIPFS(memeFile, `Meme: ${memeTitle}`);
      setIsUploadingToIPFS(false);
      
      const ipfsCid = ipfsResult.success ? ipfsResult.ipfsHash : undefined;
      
      console.log('IPFS upload result:', ipfsResult);
      
      // Get the final caption text (combine all text positions if in edit mode or use empty string if no text)
      const finalCaption = isEditMode && textPositions.length > 0
        ? textPositions.map(pos => pos.text || '').filter(Boolean).join('\n')
        : caption || '';
      
      // Create meme record in database with absolute URL
      console.log('Saving meme to database with creator_id:', user.id);
      const memeData = await createMeme({
        prompt: promptText,
        prompt_id: promptId, 
        imageUrl: publicUrl,
        ipfsCid: ipfsCid,
        caption: finalCaption,
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
      setIsGif(false);
      setGeneratedImage(null);
      setGeneratedCaptions([]);
      setImageTags([]);
      setTextPositions([]);
      setIsEditMode(false);
      
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

  // Function to save AI-generated image as a template
  const handleSaveAsTemplate = async (imageUrl: string, prompt: string) => {
    // Here we would typically save this to user's custom templates in the database
    // For now, we'll just store it in localStorage as a simple implementation
    const templateName = `AI: ${prompt.substring(0, 20)}${prompt.length > 20 ? '...' : ''}`;
    
    const customTemplates = JSON.parse(localStorage.getItem('customMemeTemplates') || '[]');
    
    customTemplates.push({
      id: `custom-${Date.now()}`,
      name: templateName,
      url: imageUrl,
      prompt,
      textPositions: [
        {
          x: 50,
          y: 50,
          fontSize: 32,
          maxWidth: 300,
          alignment: 'center'
        }
      ]
    });
    
    localStorage.setItem('customMemeTemplates', JSON.stringify(customTemplates));
    
    toast({
      title: "Template Saved",
      description: "Your AI-generated image has been saved as a template"
    });
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
          <TemplateSelector 
            selectedTemplate={selectedTemplate} 
            setSelectedTemplate={setSelectedTemplate} 
          />
        </TabsContent>
        
        <TabsContent value="upload" className="py-4">
          <ImageUploader 
            uploadedImage={uploadedImage} 
            isGif={isGif} 
            handleImageUpload={handleImageUpload} 
          />
        </TabsContent>
        
        <TabsContent value="ai-generated" className="py-4">
          <AiImageGenerator 
            promptText={promptText} 
            isGeneratingAIImage={isGeneratingAIImage} 
            generatedImage={generatedImage}
            handleGenerateImage={handleGenerateImage}
            onSaveAsTemplate={handleSaveAsTemplate}
          />
        </TabsContent>
      </Tabs>

      {/* Image analysis section */}
      {(activeTab === 'template' || uploadedImage || generatedImage) && (
        <ImageAnalyzer 
          isAnalyzingImage={isAnalyzingImage} 
          imageTags={imageTags} 
          handleAnalyzeImage={handleAnalyzeImage} 
        />
      )}
      
      {/* Caption section */}
      {!isEditMode ? (
        <div className="mb-4">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter your meme caption here..."
            className="h-24"
          />
        </div>
      ) : (
        <TextEditor
          textPositions={textPositions}
          onChange={handleTextPositionsChange}
          onRemoveText={handleRemoveTextElement}
          onAddText={handleAddTextElement}
        />
      )}
      
      {/* AI caption generator */}
      {!isEditMode && (
        <CaptionGenerator
          promptText={promptText}
          selectedStyle={selectedStyle}
          isGeneratingCaptions={isGeneratingCaptions}
          generatedCaptions={generatedCaptions}
          setSelectedStyle={setSelectedStyle}
          handleGenerateCaptions={handleGenerateCaptions}
          handleSelectCaption={handleSelectCaption}
        />
      )}
      
      {/* Preview */}
      {showPreview && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Meme Preview</h3>
          <MemeCanvas
            activeTab={activeTab}
            selectedTemplate={selectedTemplate}
            uploadedImage={uploadedImage}
            generatedImage={generatedImage}
            isGif={isGif}
            caption={caption}
            textPositions={textPositions}
            isEditMode={isEditMode}
            isDragging={isDragging}
            dragIndex={dragIndex}
            setCanvasSize={setCanvasSize}
            setDragStartPos={setDragStartPos}
            setIsDragging={setIsDragging}
            setDragIndex={setDragIndex}
            setTextPositions={setTextPositions}
          />
          <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for saving */}
        </div>
      )}
      
      {/* Save actions */}
      <SaveActions 
        isEditMode={isEditMode}
        isCreatingMeme={isCreatingMeme}
        isUploadingToIPFS={isUploadingToIPFS}
        setIsEditMode={setIsEditMode}
        handleSaveMeme={handleSaveMeme}
      />
      
      {/* Login warning */}
      {!user && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to create and save memes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MemeGenerator;
