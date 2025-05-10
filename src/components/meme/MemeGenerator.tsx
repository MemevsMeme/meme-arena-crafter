
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MEME_TEMPLATES, CAPTION_STYLES } from '@/lib/constants';
import { Image, Upload, Wand } from 'lucide-react';

interface MemeGeneratorProps {
  promptText?: string;
  onSave?: (meme: { caption: string; imageUrl: string }) => void;
}

const MemeGenerator = ({ promptText = '', onSave }: MemeGeneratorProps) => {
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(MEME_TEMPLATES[0]);
  const [caption, setCaption] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState(CAPTION_STYLES[0].id);

  const handleGenerateCaptions = () => {
    setIsGeneratingCaptions(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock responses based on the prompt
      const mockCaptions = [
        `When ${promptText.toLowerCase()} but it actually works`,
        `Nobody:\nAbsolutely nobody:\nMe: ${promptText}`,
        `${promptText}? Story of my life.`
      ];
      
      setGeneratedCaptions(mockCaptions);
      setIsGeneratingCaptions(false);
    }, 1500);
  };
  
  const handleSelectCaption = (text: string) => {
    setCaption(text);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMeme = () => {
    if (onSave) {
      onSave({
        caption,
        imageUrl: activeTab === 'template' ? selectedTemplate.url : uploadedImage || '',
      });
    }
  };

  return (
    <div className="bg-background border rounded-xl p-4 shadow-sm">
      <div className="mb-4">
        <Label htmlFor="prompt-text">Prompt</Label>
        <Textarea
          id="prompt-text"
          placeholder="Enter a prompt or use today's challenge..."
          value={promptText}
          className="h-20"
          readOnly
        />
      </div>
      
      <Tabs defaultValue="template" className="mb-4" onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="template" className="flex-1">
            <Image className="h-4 w-4 mr-2" />
            Template
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="template" className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {MEME_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-brand-purple shadow-md'
                    : 'border-transparent hover:border-muted'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <img
                  src={template.url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="py-4">
          <div className="mb-4">
            <Label htmlFor="image-upload">Upload Image</Label>
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
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="caption">Caption</Label>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={handleGenerateCaptions}
            disabled={isGeneratingCaptions}
          >
            <Wand className="h-3.5 w-3.5" />
            Generate ideas
          </Button>
        </div>
        
        {generatedCaptions.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mb-3">
            {generatedCaptions.map((captionText, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-2 whitespace-pre-line text-left"
                onClick={() => handleSelectCaption(captionText)}
              >
                {captionText}
              </Button>
            ))}
          </div>
        )}
        
        <Textarea
          id="caption"
          placeholder="Enter caption for your meme..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="h-24"
        />
      </div>
      
      <div className="mb-6">
        <Label className="mb-2 block">Caption Style</Label>
        <div className="flex flex-wrap gap-2">
          {CAPTION_STYLES.map((style) => (
            <Button
              key={style.id}
              variant={selectedStyle === style.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStyle(style.id)}
              className={selectedStyle === style.id ? 'bg-brand-purple' : ''}
            >
              {style.name}
            </Button>
          ))}
        </div>
      </div>
      
      <Button 
        className="w-full create-button" 
        size="lg"
        onClick={handleSaveMeme}
        disabled={!caption || (activeTab === 'upload' && !uploadedImage)}
      >
        Create Meme
      </Button>
    </div>
  );
};

export default MemeGenerator;
