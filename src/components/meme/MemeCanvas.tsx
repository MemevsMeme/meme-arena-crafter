import React, { useRef, useEffect, useState } from 'react';

interface MemeCanvasProps {
  activeTab: string;
  selectedTemplate: any;
  uploadedImage: string | null;
  generatedImage: string | null;
  isGif: boolean;
  caption: string;
  textPositions: TextPosition[];
  isEditMode: boolean;
  isDragging: boolean;
  dragIndex: number | null;
  setCanvasSize: (size: {width: number, height: number}) => void;
  setDragStartPos: (pos: {x: number, y: number}) => void;
  setIsDragging: (isDragging: boolean) => void;
  setDragIndex: (index: number | null) => void;
  setTextPositions: (positions: TextPosition[]) => void;
}

interface TextPosition {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  maxWidth: number;
  alignment?: 'left' | 'center' | 'right';
  color?: string;
  isBold?: boolean;
  isItalic?: boolean;
  fontFamily?: string;
  stretch?: number;
}

const MemeCanvas: React.FC<MemeCanvasProps> = ({
  activeTab,
  selectedTemplate,
  uploadedImage,
  generatedImage,
  isGif,
  caption,
  textPositions,
  isEditMode,
  isDragging,
  dragIndex,
  setCanvasSize,
  setDragStartPos,
  setIsDragging,
  setDragIndex,
  setTextPositions
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Add state to track the current drag position locally
  const [dragPosition, setDragPosition] = useState<{x: number, y: number}>({x: 0, y: 0});

  useEffect(() => {
    renderMemeToCanvas();
  }, [caption, selectedTemplate, uploadedImage, generatedImage, textPositions, isDragging, dragIndex]);

  // Enhanced text drawing function with support for font family and stretch
  const drawText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    maxWidth: number,
    alignment: 'left' | 'center' | 'right' = 'center',
    color: string = '#ffffff',
    isBold: boolean = false,
    isItalic: boolean = false,
    fontFamily: string = 'Impact',
    stretch: number = 1.0
  ) => {
    if (!text) return; // Skip empty text
    
    // Save context state to restore later
    ctx.save();
    
    // Apply horizontal scaling for text stretching
    ctx.setTransform(
      stretch, // Horizontal scaling
      0,       // Horizontal skewing
      0,       // Vertical skewing
      1,       // Vertical scaling
      x,       // Horizontal position
      y        // Vertical position
    );
    
    // Convert coordinates for proper text positioning after transform
    const adjX = 0; // X is now 0 because we translated in the transform
    const adjY = 0; // Y is now 0 because we translated in the transform
    
    // Set font style
    let fontStyle = '';
    if (isBold) fontStyle += 'bold ';
    if (isItalic) fontStyle += 'italic ';
    
    // Create font string with chosen font family and fallbacks
    ctx.font = `${fontStyle}${fontSize}px ${fontFamily}, Impact, Arial, sans-serif`;
    ctx.textAlign = alignment;
    ctx.textBaseline = 'middle';
    
    // Draw multiple strokes for better text legibility
    ctx.lineJoin = 'round'; // Rounded corners
    
    // Thicker outline for better contrast
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 5;
    ctx.strokeText(text, adjX, adjY, maxWidth / stretch);
    
    // Add second pass with thinner stroke
    ctx.lineWidth = fontSize / 8;
    ctx.strokeText(text, adjX, adjY, maxWidth / stretch);
    
    // Draw text fill with enhanced shadow for better readability
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = Math.min(4, fontSize / 6);
    ctx.shadowOffsetX = Math.min(2, fontSize / 12);
    ctx.shadowOffsetY = Math.min(2, fontSize / 12);
    ctx.fillText(text, adjX, adjY, maxWidth / stretch);
    
    // Restore context to original state
    ctx.restore();
  };

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
    
    console.log("Rendering meme to canvas");
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Load image
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      setCanvasSize({width: img.width, height: img.height});
      
      console.log(`Canvas dimensions set to ${canvas.width} x ${canvas.height}`);
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // If it's a GIF, we don't add text to the preview (will be rendered during viewing)
      if (isGif) return;
      
      // In simple mode, use the caption text
      if (!isEditMode) {
        // Add caption
        const lines = caption.split('\n');
        
        if (activeTab === 'template' && selectedTemplate.textPositions) {
          // Use predefined positions for templates
          selectedTemplate.textPositions.forEach((pos: any, index: number) => {
            if (index < lines.length) {
              drawText(
                ctx, 
                lines[index], 
                pos.x / 100 * canvas.width, 
                pos.y / 100 * canvas.height, 
                pos.fontSize, 
                pos.maxWidth,
                'center', 
                '#ffffff'
              );
            }
          });
        } else {
          // Default position for uploaded/generated images - center bottom
          const fontSize = Math.max(24, Math.min(canvas.width / 12, 48));
          const lineHeight = fontSize * 1.2;
          const totalHeight = lines.length * lineHeight;
          
          lines.forEach((line, index) => {
            drawText(
              ctx,
              line,
              canvas.width / 2,
              canvas.height - totalHeight + index * lineHeight,
              fontSize,
              canvas.width * 0.8,
              'center',
              '#ffffff'
            );
          });
        }
      }
      // In edit mode, use the text positions
      else {
        console.log(`Rendering ${textPositions.length} text elements in edit mode`);
        textPositions.forEach((position, index) => {
          if (position.text) {
            console.log(`Drawing text: "${position.text}" at (${position.x}%, ${position.y}%)`);
            drawText(
              ctx,
              position.text,
              position.x / 100 * canvas.width,
              position.y / 100 * canvas.height,
              position.fontSize,
              position.maxWidth,
              position.alignment || 'center',
              position.color || '#ffffff',
              position.isBold,
              position.isItalic,
              position.fontFamily || 'Impact',
              position.stretch || 1.0
            );
            
            // Draw a visual indicator for the text element being dragged
            if (isEditMode && dragIndex === index) {
              ctx.strokeStyle = '#ff3366';
              ctx.lineWidth = 2;
              
              // Get text metrics for proper highlight
              let fontStyle = '';
              if (position.isBold) fontStyle += 'bold ';
              if (position.isItalic) fontStyle += 'italic ';
              ctx.font = `${fontStyle}${position.fontSize}px ${position.fontFamily || 'Impact'}, sans-serif`;
              
              // Account for text stretching in the highlight box
              const metrics = ctx.measureText(position.text);
              const stretchFactor = position.stretch || 1.0;
              const textWidth = Math.min(metrics.width * stretchFactor, position.maxWidth);
              const textHeight = position.fontSize;
              
              // Draw highlight rectangle
              let rectX;
              if (position.alignment === 'left') {
                rectX = position.x / 100 * canvas.width;
              } else if (position.alignment === 'right') {
                rectX = position.x / 100 * canvas.width - textWidth;
              } else {
                rectX = position.x / 100 * canvas.width - textWidth / 2;
              }
              
              const rectY = position.y / 100 * canvas.height - textHeight / 2;
              ctx.strokeRect(rectX - 5, rectY - 5, textWidth + 10, textHeight + 10);
            }
          }
        });
      }
    };
    
    // Handle image loading errors
    img.onerror = (e) => {
      console.error("Error loading image:", e);
      // Draw an error placeholder
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#ff0000';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Error loading image', 200, 150);
    };
    
    let imageSrc = '';
    if (activeTab === 'template') {
      imageSrc = selectedTemplate.url;
    } else if (activeTab === 'upload') {
      imageSrc = uploadedImage as string;
    } else if (activeTab === 'ai-generated') {
      imageSrc = generatedImage as string;
    }
    
    console.log(`Loading image source: ${imageSrc.substring(0, 100)}...`);
    img.src = imageSrc;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEditMode) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (!isEditMode) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      // Check if we clicked on a text element
      for (let i = 0; i < textPositions.length; i++) {
        const pos = textPositions[i];
        const textX = pos.x / 100 * canvas.width;
        const textY = pos.y / 100 * canvas.height;
        
        // Improved hit test with actual text dimensions
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Set appropriate font to measure text accurately
          let fontStyle = '';
          if (pos.isBold) fontStyle += 'bold ';
          if (pos.isItalic) fontStyle += 'italic ';
          ctx.font = `${fontStyle}${pos.fontSize}px ${pos.fontFamily || 'Impact'}, sans-serif`;
          
          // Get text metrics for better hit testing
          const metrics = ctx.measureText(pos.text);
          const stretchFactor = pos.stretch || 1.0;
          const textWidth = Math.min(metrics.width * stretchFactor, pos.maxWidth);
          const textHeight = pos.fontSize;
          
          // Adjust based on alignment
          let textXStart;
          if (pos.alignment === 'left') {
            textXStart = textX;
          } else if (pos.alignment === 'right') {
            textXStart = textX - textWidth;
          } else {
            textXStart = textX - textWidth / 2;
          }
          
          // Perform hit test with accurate dimensions
          if (
            mouseX >= textXStart - 10 && 
            mouseX <= textXStart + textWidth + 10 && 
            mouseY >= textY - textHeight/2 - 10 && 
            mouseY <= textY + textHeight/2 + 10
          ) {
            console.log(`Text element ${i} clicked:`, pos.text);
            setIsDragging(true);
            setDragIndex(i);
            
            // Store the current mouse position locally and in parent component
            setDragPosition({x: mouseX, y: mouseY});
            setDragStartPos({x: mouseX, y: mouseY});
            
            // Force a re-render with highlight
            const updatedPositions = [...textPositions];
            setTextPositions(updatedPositions);
            
            break;
          }
        }
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || dragIndex === null) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      
      // Calculate the delta movement using our local state
      const dx = mouseX - dragPosition.x;
      const dy = mouseY - dragPosition.y;
      
      const updatedPositions = [...textPositions];
      const currentPos = updatedPositions[dragIndex];
      
      // Convert pixel movement to percentage of canvas
      const newX = Math.max(0, Math.min(100, currentPos.x + (dx / canvas.width * 100)));
      const newY = Math.max(0, Math.min(100, currentPos.y + (dy / canvas.height * 100)));
      
      updatedPositions[dragIndex] = {
        ...currentPos,
        x: newX,
        y: newY
      };
      
      setTextPositions(updatedPositions);
      
      // Update our local drag position and the parent component's position
      setDragPosition({x: mouseX, y: mouseY});
      setDragStartPos({x: mouseX, y: mouseY});
      
      // Re-render the canvas
      renderMemeToCanvas();
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        console.log(`Finished dragging text ${dragIndex}`);
        setIsDragging(false);
        setDragIndex(null);
      }
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    console.log("Canvas drag event listeners added");
    
    // Cleanup on unmount
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      console.log("Canvas drag event listeners removed");
    };
  }, [isEditMode, textPositions, isDragging, dragIndex, dragPosition]);

  return (
    <div className="relative border rounded overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`w-full ${isEditMode ? 'cursor-move' : ''}`}
        style={{ maxHeight: '500px', objectFit: 'contain' }}
      />
      {isEditMode && (
        <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-2 py-1 rounded">
          Edit Mode: Drag text to reposition
        </div>
      )}
    </div>
  );
};

export default MemeCanvas;
