
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand, Save, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AiImageGeneratorProps {
  promptText: string;
  isGeneratingAIImage: boolean;
  generatedImage: string | null;
  handleGenerateImage: () => void;
  onSaveAsTemplate?: (imageUrl: string, promptText: string) => void;
}

const AiImageGenerator: React.FC<AiImageGeneratorProps> = ({
  promptText,
  isGeneratingAIImage,
  generatedImage,
  handleGenerateImage,
  onSaveAsTemplate
}) => {
  const [isLocalFallback, setIsLocalFallback] = useState(false);
  
  const handleImageGeneration = () => {
    if (!promptText) {
      toast({
        title: "Error",
        description: "Please enter a prompt text first",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Generating image...",
      description: "Using local templates as fallback due to API limitations",
    });
    
    setIsLocalFallback(false);
    handleGenerateImage();
  };

  const handleSaveAsTemplate = () => {
    if (generatedImage && onSaveAsTemplate) {
      onSaveAsTemplate(generatedImage, promptText);
      toast({
        title: "Success",
        description: "Image saved as template"
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Button 
          onClick={handleImageGeneration} 
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
          <p className="mt-4 text-sm text-muted-foreground">Creating a meme image based on your prompt...</p>
          <p className="mt-2 text-xs text-muted-foreground">This might take a moment</p>
        </div>
      )}
      
      {!isGeneratingAIImage && !generatedImage && (
        <div className="aspect-square max-h-64 mx-auto mb-4 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
          <p className="text-sm text-muted-foreground p-4 text-center">
            Click the button above to generate an image based on your prompt
          </p>
        </div>
      )}
      
      {generatedImage && (
        <div className="flex flex-col">
          <div className="aspect-square max-h-64 mx-auto mb-4 rounded-lg overflow-hidden">
            <img
              src={generatedImage}
              alt="Generated Image"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Image failed to load:", generatedImage);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          
          {generatedImage.startsWith('data:') ? (
            // Only show save template button for actual AI generated images
            onSaveAsTemplate && (
              <Button 
                onClick={handleSaveAsTemplate} 
                variant="outline" 
                className="mt-2"
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Template
              </Button>
            )
          ) : (
            <Alert variant="warning" className="mt-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription className="text-xs">
                Using a template image as fallback due to AI service limitations
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default AiImageGenerator;
