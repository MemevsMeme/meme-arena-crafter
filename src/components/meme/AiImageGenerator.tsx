
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AiImageGeneratorProps {
  promptText: string;
  isGeneratingAIImage: boolean;
  generatedImage: string | null;
  handleGenerateImage: () => void;
}

const AiImageGenerator: React.FC<AiImageGeneratorProps> = ({
  promptText,
  isGeneratingAIImage,
  generatedImage,
  handleGenerateImage
}) => {
  return (
    <div>
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
          <p className="mt-4 text-sm text-muted-foreground">Creating your meme image with Gemini AI...</p>
          <p className="mt-2 text-xs text-muted-foreground">This might take up to 30 seconds</p>
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
        <div className="aspect-square max-h-64 mx-auto mb-4 rounded-lg overflow-hidden">
          <img
            src={generatedImage}
            alt="AI Generated"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default AiImageGenerator;
