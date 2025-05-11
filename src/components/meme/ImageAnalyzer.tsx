
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface ImageAnalyzerProps {
  isAnalyzingImage: boolean;
  imageTags: string[];
  handleAnalyzeImage: () => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({
  isAnalyzingImage,
  imageTags,
  handleAnalyzeImage
}) => {
  return (
    <div className="mb-4">
      <Button
        onClick={handleAnalyzeImage}
        variant="outline"
        size="sm"
        className="mb-2"
        disabled={isAnalyzingImage}
      >
        {isAnalyzingImage ? 'Analyzing...' : 'Analyze Image'}
        <Tag className="ml-2 h-4 w-4" />
      </Button>
      
      {imageTags.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Image tags:</p>
          <div className="flex flex-wrap gap-1">
            {imageTags.map((tag, index) => (
              <Badge key={index} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
