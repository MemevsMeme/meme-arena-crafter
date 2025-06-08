import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface MemeEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

const MemeEditor = ({ imageUrl, onSave, onCancel }: MemeEditorProps) => {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(32);

  const handleSave = () => {
    // For simplicity, we'll just pass back the original image URL with metadata
    // In a real implementation, we would render the text onto the image with canvas
    onSave(imageUrl);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="text-xl font-heading font-bold mb-4">Customize Your Meme</div>
        
        <div className="relative w-full mb-6">
          <div className="meme-container relative overflow-hidden rounded-lg border border-gray-300">
            <img 
              src={imageUrl} 
              alt="Meme" 
              className="w-full object-contain max-h-[400px]" 
            />
            
            {topText && (
              <div 
                className="absolute top-0 left-0 right-0 p-2 text-center"
                style={{ 
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  fontSize: `${fontSize}px`,
                  color: textColor,
                  textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  wordWrap: 'break-word'
                }}
              >
                {topText}
              </div>
            )}
            
            {bottomText && (
              <div 
                className="absolute bottom-0 left-0 right-0 p-2 text-center"
                style={{ 
                  fontFamily: 'Impact, "Arial Black", sans-serif',
                  fontSize: `${fontSize}px`,
                  color: textColor,
                  textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  wordWrap: 'break-word'
                }}
              >
                {bottomText}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Top Text</label>
            <Input 
              type="text" 
              placeholder="Enter top text" 
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bottom Text</label>
            <Input 
              type="text" 
              placeholder="Enter bottom text" 
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Text Color</label>
              <div className="flex items-center">
                <input 
                  type="color" 
                  value={textColor} 
                  onChange={(e) => setTextColor(e.target.value)} 
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <span className="ml-2 text-sm">{textColor}</span>
              </div>
            </div>
            
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Font Size: {fontSize}px</label>
              <input 
                type="range" 
                min="16" 
                max="72" 
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full" 
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="default">
            <i className="ri-save-line mr-2"></i>
            Save Meme
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemeEditor;