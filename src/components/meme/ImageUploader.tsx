
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Maximize } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
        <div className="aspect-square max-h-64 mx-auto mb-4 rounded-lg overflow-hidden relative">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-full h-full object-contain"
          />
          
          {/* Preview popup button */}
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded hover:bg-black/90"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[90vw] max-w-[800px]">
              <div className="p-1">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded Image Preview" 
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="p-2 text-center text-sm">
                  {isGif && (
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <Gift className="h-3 w-3" />
                      <span>Animated GIF</span>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
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
