import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import TemplateSelector from '@/components/meme/TemplateSelector';
import MemeCanvas from '@/components/meme/MemeCanvas';
import ImageUploader from '@/components/meme/ImageUploader';
import AiImageGenerator from '@/components/meme/AiImageGenerator';
import CaptionGenerator from '@/components/meme/CaptionGenerator';
import TextEditor, { TextPosition } from '@/components/meme/TextEditor';
import SaveActions from '@/components/meme/SaveActions';
import { supabase } from '@/integrations/supabase/client';
import { createMeme } from '@/lib/database';
import { uploadFileToIPFS, pinUrlToIPFS } from '@/lib/ipfs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { generateMemeImage } from '@/lib/ai';

interface MemeGeneratorProps {
  promptText: string;
  promptId?: string;
  onSave?: (meme: { id: string; caption: string; imageUrl: string }) => void;
  defaultEditMode?: boolean;
  defaultTemplate?: any;
}

const MemeGenerator: React.FC<MemeGeneratorProps> = ({
  promptText,
  promptId,
  onSave,
  defaultEditMode = false,
  defaultTemplate = null
}) => {
  const { user } = useAuth();
  
  // State variables for templates
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(defaultTemplate);
  
  // State variables for uploaded/generated images
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGif, setIsGif] = useState(false);
  
  // State variables for text
  const [caption, setCaption] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(defaultEditMode);
  const [textPositions, setTextPositions] = useState<TextPosition[]>([
    {
      text: '',
      x: 50,
      y: 85,
      fontSize: 36,
      maxWidth: 300,
      alignment: 'center',
      color: '#ffffff',
      isBold: true,
      fontFamily: 'Impact'
    }
  ]);
  
  // State variables for canvas
  const [canvasSize, setCanvasSize] = useState<{width: number, height: number}>({
    width: 600,
    height: 600
  });
  
  // State variables for drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  
  // State variables for saving the meme
  const [isCreatingMeme, setIsCreatingMeme] = useState(false);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [isGeneratingAIImage, setIsGeneratingAIImage] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState('funny');
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Add custom prompt state for AI image generation
  const [customImagePrompt, setCustomImagePrompt] = useState<string>("");
  
  // Add state for debugging
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveDetails, setSaveDetails] = useState<any | null>(null);

  // Add text handler
  const handleAddText = () => {
    const newPosition: TextPosition = {
      text: 'New text',
      x: 50,
      y: 50,
      fontSize: 30,
      maxWidth: 300,
      alignment: 'center',
      color: '#ffffff',
      isBold: true,
      fontFamily: 'Impact'
    };
    
    setTextPositions([...textPositions, newPosition]);
    
    // Enter edit mode when adding text
    if (!isEditMode) {
      setIsEditMode(true);
    }
  };
  
  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if it's a GIF
    const isGifImage = file.type === 'image/gif';
    setIsGif(isGifImage);
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setActiveTab('upload');
    
    // Reset template selection and AI generated image
    setSelectedTemplate(null);
    setGeneratedImage(null);
    
    // Create a default caption from the prompt if no caption yet
    if (!caption && promptText) {
      setCaption(promptText);
    }
  };
  
  // Handler for setting captions
  const handleSetCaption = (newCaption: string) => {
    setCaption(newCaption);
    
    // Also update the first text position in edit mode
    if (textPositions.length > 0) {
      const updatedPositions = [...textPositions];
      updatedPositions[0] = {
        ...updatedPositions[0],
        text: newCaption
      };
      setTextPositions(updatedPositions);
    }
  };

  // Handler for generating AI image with custom prompt
  const handleGenerateImage = async () => {
    if (!promptText && !customImagePrompt) {
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
      // Use custom prompt if provided, otherwise use the original promptText
      const finalPrompt = customImagePrompt || promptText;
      
      // Call the AI image generation function from lib/ai.ts
      const imageData = await generateMemeImage(finalPrompt, selectedCaptionStyle);
      
      if (imageData) {
        console.log('AI image generated successfully');
        setGeneratedImage(imageData);
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating AI image:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAIImage(false);
    }
  };
  
  // Handler for generating captions using AI
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
      // Import and use the generateCaption function from lib/ai.ts
      const { generateCaption } = await import('@/lib/ai');
      const captions = await generateCaption(promptText, selectedCaptionStyle);
      
      setGeneratedCaptions(captions);
    } catch (error) {
      console.error('Error generating captions:', error);
      toast({
        title: "Error",
        description: "Failed to generate captions. Please try again.",
        variant: "destructive"
      });
      
      // Fallback captions in case of error
      setGeneratedCaptions([
        `When ${promptText ? promptText.toLowerCase() : 'trying'} but it actually works`,
        `Nobody:\nAbsolutely nobody:\nMe: ${promptText || 'doing meme stuff'}`,
        `${promptText || 'This meme'}? Story of my life.`
      ]);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Handler for selecting a generated caption
  const handleSelectCaption = (caption: string) => {
    handleSetCaption(caption);
  };

  // Handler for updating text positions
  const handleTextPositionsChange = (positions: TextPosition[]) => {
    setTextPositions(positions);
  };
  
  // Handler for removing text
  const handleRemoveText = (index: number) => {
    const updatedPositions = [...textPositions];
    updatedPositions.splice(index, 1);
    setTextPositions(updatedPositions);
  };
  
  // Handler for saving the meme
  const handleSaveMeme = async () => {
    if (!user) {
      toast({
        title: "You need to be logged in",
        description: "Please login to create memes",
        variant: "destructive"
      });
      return;
    }
    
    if (isCreatingMeme) {
      return; // Prevent multiple clicks
    }
    
    try {
      console.log('Starting meme creation process with user:', user);
      setSaveAttempted(true);
      setSaveError(null);
      setSaveDetails(null);
      setIsCreatingMeme(true);
      
      // Get the active image source
      let imageSource: string | null = null;
      
      if (activeTab === 'template' && selectedTemplate) {
        imageSource = selectedTemplate.url;
      } else if (activeTab === 'upload' && uploadedImage) {
        imageSource = uploadedImage;
      } else if (activeTab === 'ai-generated' && generatedImage) {
        imageSource = generatedImage;
      }
      
      if (!imageSource) {
        toast({
          title: "No image selected",
          description: "Please select or upload an image first",
          variant: "destructive"
        });
        setIsCreatingMeme(false);
        setSaveError("No image selected");
        return;
      }
      
      console.log('Saving meme with image source:', imageSource.substring(0, 30) + '...');
      
      // Render the meme with text onto a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Load the image onto a hidden canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // Add caption text if not a GIF (for GIFs text will be added during display)
          if (!isGif) {
            if (isEditMode) {
              // Draw all text positions in edit mode
              textPositions.forEach(position => {
                if (position.text) {
                  // Setup font and style
                  let fontStyle = '';
                  if (position.isBold) fontStyle += 'bold ';
                  if (position.isItalic) fontStyle += 'italic ';
                  
                  ctx.font = `${fontStyle}${position.fontSize}px ${position.fontFamily || 'Impact'}, sans-serif`;
                  ctx.textAlign = position.alignment || 'center';
                  ctx.fillStyle = position.color || '#ffffff';
                  ctx.strokeStyle = 'black';
                  ctx.lineWidth = position.fontSize / 15;
                  ctx.lineJoin = 'round';
                  
                  // Calculate x position based on alignment
                  let x = (position.x / 100) * canvas.width;
                  
                  // Draw text with outline
                  ctx.strokeText(
                    position.text,
                    x,
                    (position.y / 100) * canvas.height,
                    position.maxWidth
                  );
                  ctx.fillText(
                    position.text,
                    x,
                    (position.y / 100) * canvas.height,
                    x,
                    position.maxWidth
                  );
                }
              });
            } else {
              // Simple mode: add caption at the bottom
              const lines = caption ? caption.split('\n') : [];
              
              if (lines.length > 0) {
                const fontSize = Math.max(24, Math.min(canvas.width / 12, 48));
                const lineHeight = fontSize * 1.2;
                const totalHeight = lines.length * lineHeight;
                
                ctx.font = `bold ${fontSize}px Impact, sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = fontSize / 15;
                ctx.lineJoin = 'round';
                
                lines.forEach((line, index) => {
                  if (line) {
                    const y = canvas.height - totalHeight + index * lineHeight;
                    
                    // Draw text outline
                    ctx.strokeText(
                      line,
                      canvas.width / 2,
                      y,
                      canvas.width * 0.8
                    );
                    
                    // Fill text
                    ctx.fillText(
                      line,
                      canvas.width / 2,
                      y,
                      canvas.width * 0.8
                    );
                  }
                });
              }
            }
          }
          
          resolve();
        };
        
        img.onerror = (e) => {
          console.error('Failed to load image:', e);
          reject(new Error('Failed to load image'));
        };
        
        img.src = imageSource as string;
      });
      
      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, isGif ? 'image/gif' : 'image/png');
      });
      
      if (!blob) {
        throw new Error('Failed to create image blob');
      }
      
      // Generate unique file name
      const fileExt = isGif ? '.gif' : '.png';
      const fileName = `${uuidv4()}${fileExt}`;
      
      console.log('Uploading meme to storage bucket');
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes')
        .upload(`public/${user.id}/${fileName}`, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: isGif ? 'image/gif' : 'image/png',
        });
      
      if (uploadError) {
        console.error('Error uploading to storage:', uploadError);
        setSaveError(`Error uploading to storage: ${uploadError.message}`);
        throw new Error(`Error uploading to storage: ${uploadError.message}`);
      }
      
      console.log('Upload successful:', uploadData);
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('memes')
        .getPublicUrl(`public/${user.id}/${fileName}`);
      
      if (!publicUrlData?.publicUrl) {
        setSaveError('Failed to get public URL');
        throw new Error('Failed to get public URL');
      }
      
      const imageUrl = publicUrlData.publicUrl;
      console.log('Public URL:', imageUrl);
      
      // Upload to IPFS in the background (don't wait for it)
      let ipfsCid: string | undefined = undefined;
      try {
        setIsUploadingToIPFS(true);
        console.log('Starting IPFS upload');
        
        // Create a File from the blob
        const file = new File([blob], fileName, {
          type: isGif ? 'image/gif' : 'image/png',
        });
        
        // Upload to IPFS
        const ipfsResult = await uploadFileToIPFS(file, `Meme: ${caption.substring(0, 30)}...`);
        
        if (ipfsResult.success && ipfsResult.ipfsHash) {
          ipfsCid = ipfsResult.ipfsHash;
          console.log('Successfully pinned to IPFS with CID:', ipfsCid);
        }
      } catch (ipfsError) {
        console.error('IPFS upload failed but continuing:', ipfsError);
        // Non-fatal error, continue without IPFS
      } finally {
        setIsUploadingToIPFS(false);
      }
      
      console.log('Creating meme record in database with:', {
        promptText,
        promptId,
        imageUrl,
        ipfsCid,
        caption: caption || '',
        creatorId: user.id
      });

      // Create meme record in database
      const newMeme = await createMeme({
        prompt: promptText,
        prompt_id: promptId,
        imageUrl,
        ipfsCid,
        caption: caption || '',
        creatorId: user.id,
        votes: 0,
        createdAt: new Date(),
        tags: []
      });
      
      if (!newMeme) {
        setSaveError('Failed to create meme record in database');
        throw new Error('Failed to create meme record in database');
      }
      
      console.log('Meme created successfully:', newMeme);
      setSaveDetails(newMeme);
      
      toast({
        title: "Success",
        description: "Your meme has been created successfully!",
      });
      
      // Call onSave callback if provided
      if (onSave && newMeme) {
        console.log('Calling onSave callback with:', newMeme);
        onSave({
          id: newMeme.id,
          caption: newMeme.caption,
          imageUrl: newMeme.imageUrl
        });
      }
      
    } catch (error) {
      console.error('Error creating meme:', error);
      setSaveError(error instanceof Error ? error.message : "Failed to create meme");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create meme",
        variant: "destructive"
      });
    } finally {
      setIsCreatingMeme(false);
    }
  };
  
  return (
    <div className="meme-generator border rounded-xl p-4 bg-background shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Create Your Meme</h2>
      <p className="text-muted-foreground mb-4">
        <span className="font-medium">Prompt:</span> {promptText || "Create something funny!"}
      </p>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="mb-2">
          <TabsTrigger value="template">Use Template</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="ai-generated">AI Generate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="template">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
        </TabsContent>
        
        <TabsContent value="upload">
          <ImageUploader 
            uploadedImage={uploadedImage}
            isGif={isGif}
            handleImageUpload={handleImageUpload}
          />
        </TabsContent>
        
        <TabsContent value="ai-generated">
          <AiImageGenerator
            promptText={promptText}
            isGeneratingAIImage={isGeneratingAIImage}
            generatedImage={generatedImage}
            handleGenerateImage={handleGenerateImage}
            onSaveAsTemplate={setSelectedTemplate}
          />
        </TabsContent>
      </Tabs>
      
      {/* Canvas for meme preview - rendered by MemeCanvas component */}
      <div className="meme-preview my-4">
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
      </div>
      
      {/* Text editing section */}
      {isEditMode ? (
        <TextEditor
          textPositions={textPositions}
          onChange={handleTextPositionsChange}
          onAddText={handleAddText}
          onRemoveText={handleRemoveText}
        />
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Caption</label>
          <div className="flex gap-2">
            <div className="flex-grow">
              <Textarea
                placeholder="Add your caption here..."
                value={caption}
                onChange={(e) => handleSetCaption(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          
          <CaptionGenerator
            promptText={promptText}
            selectedStyle={selectedCaptionStyle}
            isGeneratingCaptions={isGeneratingCaptions}
            generatedCaptions={generatedCaptions}
            setSelectedStyle={setSelectedCaptionStyle}
            handleGenerateCaptions={handleGenerateCaptions}
            handleSelectCaption={handleSelectCaption}
          />
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
      
      {saveAttempted && saveError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
          <div className="font-semibold text-red-800">Error creating meme:</div>
          <div className="text-red-700">{saveError}</div>
        </div>
      )}
    </div>
  );
};

export default MemeGenerator;
