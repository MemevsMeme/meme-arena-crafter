
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

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
      description: "This might take up to 45 seconds with Gemini 2.0",
    });
    
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
          <p className="mt-4 text-sm text-muted-foreground">Creating your meme image with Gemini 2.0...</p>
          <p className="mt-2 text-xs text-muted-foreground">This might take up to 45 seconds</p>
        </div>
      )}
      
      {!isGeneratingAIImage && !generatedImage && (
        <div className="aspect-square max-h-64 mx-auto mb-4 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
          <p className="text-sm text-muted-foreground p-4 text-center">
            Click the button above to generate an AI image based on your prompt
          </p>
        </div>
      )}
      
      {generatedImage && (
        <div className="flex flex-col">
          <div className="aspect-square max-h-64 mx-auto mb-4 rounded-lg overflow-hidden">
            <img
              src={generatedImage}
              alt="AI Generated"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Image failed to load:", generatedImage);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          
          {onSaveAsTemplate && (
            <Button 
              onClick={handleSaveAsTemplate} 
              variant="outline" 
              className="mt-2"
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AiImageGenerator;
