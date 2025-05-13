
import React, { useRef, useEffect, useState } from 'react';

interface TextPosition {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  maxWidth?: number;
  alignment?: 'left' | 'center' | 'right';
  color?: string;
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?: string;
  stretch?: number;
}

interface MemeCanvasProps {
  selectedImage?: string;
  uploadedImage: string | null;
  generatedImage: string | null;
  texts: { text: string; position: { x: number; y: number } }[];
  caption: string;
}

const MemeCanvas: React.FC<MemeCanvasProps> = ({
  selectedImage,
  uploadedImage,
  generatedImage,
  texts,
  caption
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderMemeToCanvas();
  }, [caption, selectedImage, uploadedImage, generatedImage, texts]);

  const renderMemeToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas ref is null");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log("Could not get canvas context");
      return;
    }
    
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
      if (caption) {
        const fontSize = Math.max(24, Math.min(canvas.width / 12, 48));
        ctx.font = `${fontSize}px Impact, sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(caption, canvas.width / 2, canvas.height - 30);
      }

      // Add texts
      texts.forEach(item => {
        const x = item.position.x / 100 * canvas.width;
        const y = item.position.y / 100 * canvas.height;
        
        ctx.font = '24px Impact, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(item.text, x, y);
      });
    };
    
    // Handle image loading errors
    img.onerror = () => {
      console.error("Error loading image");
      // Draw a placeholder
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#ff0000';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Error loading image', 200, 150);
    };
    
    let imageSrc = '';
    if (selectedImage) {
      imageSrc = selectedImage;
    } else if (uploadedImage) {
      imageSrc = uploadedImage;
    } else if (generatedImage) {
      imageSrc = generatedImage;
    }
    
    if (!imageSrc) {
      console.error("No valid image source found");
      // Draw a placeholder
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#333333';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No image selected', 200, 150);
      return;
    }
    
    img.src = imageSrc;
  };

  return (
    <div className="relative border rounded overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ maxHeight: '500px', objectFit: 'contain' }}
      />
    </div>
  );
};

export default MemeCanvas;
