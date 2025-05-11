
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift } from 'lucide-react';

interface ImageUploaderProps {
  uploadedImage: string | null;
  isGif: boolean;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  uploadedImage, 
  isGif, 
  handleImageUpload 
}) => {
  return (
    <div>
      <div className="mb-4">
        <Label htmlFor="image-upload" className="flex items-center gap-2">
          Upload Image <Gift className="h-4 w-4 text-brand-purple" /> <span className="text-xs text-muted-foreground">(GIFs supported)</span>
        </Label>
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
          {isGif && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-center">
              <Gift className="h-3 w-3 inline-block mr-1" />
              Animated GIF detected. Text will appear during viewing.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
