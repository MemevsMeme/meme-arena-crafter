
import React from 'react';
import { Button } from '@/components/ui/button';
import { WandSparkles } from 'lucide-react';
import { CAPTION_STYLES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface CaptionGeneratorProps {
  promptText: string;
  selectedStyle: string;
  isGeneratingCaptions: boolean;
  generatedCaptions: string[];
  setSelectedStyle: (style: string) => void;
  handleGenerateCaptions: () => void;
  handleSelectCaption: (caption: string) => void;
}

const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({
  promptText,
  selectedStyle,
  isGeneratingCaptions,
  generatedCaptions,
  setSelectedStyle,
  handleGenerateCaptions,
  handleSelectCaption
}) => {
  const onGenerateCaptions = () => {
    if (!promptText) {
      toast({
        title: "Error",
        description: "Please enter a prompt text first",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Generating captions...",
      description: "This might take a few seconds with Gemini AI",
    });
    
    handleGenerateCaptions();
  };
  
  return (
    <div className="mb-6 p-4 bg-muted/20 rounded-lg border">
      <h3 className="font-medium mb-2">AI Caption Generator</h3>
      
      <div className="mb-4">
        <Label htmlFor="caption-style" className="text-sm mb-1 block">Caption Style</Label>
        <Select value={selectedStyle} onValueChange={setSelectedStyle}>
          <SelectTrigger id="caption-style">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {CAPTION_STYLES.map((style) => (
              <SelectItem key={style.id} value={style.id}>
                {style.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={onGenerateCaptions} 
        variant="outline" 
        className="w-full mb-4"
        disabled={isGeneratingCaptions || !promptText}
      >
        {isGeneratingCaptions ? 'Generating...' : 'Generate Captions'}
        <WandSparkles className="ml-2 h-4 w-4" />
      </Button>
      
      {isGeneratingCaptions && (
        <div className="space-y-2 max-h-60">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}
      
      {!isGeneratingCaptions && generatedCaptions && generatedCaptions.length > 0 && (
        <div>
          <Label className="text-sm mb-2 block">Select a caption:</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {generatedCaptions.map((caption, index) => (
              <div 
                key={index} 
                className="p-2 text-sm border rounded cursor-pointer hover:bg-muted"
                onClick={() => handleSelectCaption(caption)}
              >
                {caption}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptionGenerator;
