
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Plus, Minus, Trash2 } from 'lucide-react';

export interface TextPosition {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  maxWidth: number;
  alignment?: 'left' | 'center' | 'right';
  color?: string;
  isBold?: boolean;
  isItalic?: boolean;
}

interface TextEditorProps {
  textPositions: TextPosition[];
  onChange: (positions: TextPosition[]) => void;
  onRemoveText?: (index: number) => void;
  onAddText?: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  textPositions, 
  onChange, 
  onRemoveText,
  onAddText
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  useEffect(() => {
    // Set the first position as active if available
    if (textPositions.length > 0 && activeIndex === null) {
      setActiveIndex(0);
    } else if (textPositions.length === 0) {
      setActiveIndex(null);
    } else if (activeIndex !== null && activeIndex >= textPositions.length) {
      // Adjust the active index if it's out of bounds
      setActiveIndex(textPositions.length - 1);
    }
  }, [textPositions, activeIndex]);

  const handleTextChange = (index: number, text: string) => {
    const updated = [...textPositions];
    updated[index] = { ...updated[index], text };
    onChange(updated);
  };

  const handlePositionChange = (index: number, axis: 'x' | 'y', value: number) => {
    const updated = [...textPositions];
    updated[index] = { ...updated[index], [axis]: value };
    onChange(updated);
  };

  const handleFontSizeChange = (index: number, delta: number) => {
    const updated = [...textPositions];
    const newSize = Math.max(10, Math.min(50, updated[index].fontSize + delta));
    updated[index] = { ...updated[index], fontSize: newSize };
    onChange(updated);
  };

  const handleAlignmentChange = (index: number, alignment: 'left' | 'center' | 'right') => {
    const updated = [...textPositions];
    updated[index] = { ...updated[index], alignment };
    onChange(updated);
  };

  const handleStyleChange = (index: number, style: 'isBold' | 'isItalic') => {
    const updated = [...textPositions];
    updated[index] = { 
      ...updated[index], 
      [style]: !updated[index][style] 
    };
    onChange(updated);
  };

  const handleColorChange = (index: number, color: string) => {
    const updated = [...textPositions];
    updated[index] = { ...updated[index], color };
    onChange(updated);
  };

  if (textPositions.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-muted-foreground mb-4">No text elements added yet</p>
        {onAddText && (
          <Button onClick={onAddText} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Text
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <Label className="text-sm font-medium">Text Elements</Label>
        <div className="flex-grow"></div>
        {onAddText && (
          <Button onClick={onAddText} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {textPositions.map((position, index) => (
          <div 
            key={index} 
            className={`p-3 border rounded-md ${activeIndex === index ? 'border-brand-purple bg-muted/20' : 'border-border'}`}
            onClick={() => setActiveIndex(index)}
          >
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">{`Text ${index + 1}`}</Label>
              {onRemoveText && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveText(index);
                  }}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Input
              value={position.text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              placeholder="Enter text"
              className="mb-2"
            />
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <Label className="text-xs block mb-1">X Position (%)</Label>
                <Input
                  type="number"
                  value={position.x}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => handlePositionChange(index, 'x', Number(e.target.value))}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs block mb-1">Y Position (%)</Label>
                <Input
                  type="number"
                  value={position.y}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => handlePositionChange(index, 'y', Number(e.target.value))}
                  className="h-8"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-xs block mb-1">Font Size</Label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFontSizeChange(index, -2)}
                    className="h-8 px-2"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="mx-2 text-xs font-medium">{position.fontSize}px</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFontSizeChange(index, 2)}
                    className="h-8 px-2"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs block mb-1">Color</Label>
                <Input
                  type="color"
                  value={position.color || '#ffffff'}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="h-8 w-16 p-1"
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-2">
              <div>
                <Label className="text-xs block mb-1">Alignment</Label>
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlignmentChange(index, 'left')}
                    className={`h-8 rounded-none ${position.alignment === 'left' ? 'bg-brand-purple text-white' : ''}`}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlignmentChange(index, 'center')}
                    className={`h-8 rounded-none ${position.alignment === 'center' || !position.alignment ? 'bg-brand-purple text-white' : ''}`}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlignmentChange(index, 'right')}
                    className={`h-8 rounded-none ${position.alignment === 'right' ? 'bg-brand-purple text-white' : ''}`}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs block mb-1">Style</Label>
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStyleChange(index, 'isBold')}
                    className={`h-8 rounded-none ${position.isBold ? 'bg-brand-purple text-white' : ''}`}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStyleChange(index, 'isItalic')}
                    className={`h-8 rounded-none ${position.isItalic ? 'bg-brand-purple text-white' : ''}`}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextEditor;
