
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTodaysChallenge, getFallbackChallenge } from '@/lib/dailyChallenges';
import { Prompt } from '@/lib/types';
import TemplateSelector from '@/components/meme/TemplateSelector';
import MemeCanvas from '@/components/meme/MemeCanvas';
import TextEditor from '@/components/meme/TextEditor';
import CaptionGenerator from '@/components/meme/CaptionGenerator';
import ImageUploader from '@/components/meme/ImageUploader';
import SaveActions from '@/components/meme/SaveActions';
import AiImageGenerator from '@/components/meme/AiImageGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateCaption, generateMemeImage } from '@/lib/ai';
import { createMeme } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PromptOfTheDay from '@/components/meme/PromptOfTheDay';
import { getCurrentDayOfYear } from '@/lib/database';

const MemeGenerator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [memeTexts, setMemeTexts] = useState<{ text: string; position: { x: number; y: number } }[]>([]);
  const [caption, setCaption] = useState('');
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [isGeneratingAIImage, setIsGeneratingAIImage] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('funny');
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('templates');

  useEffect(() => {
    const loadDailyChallenge = async () => {
      try {
        const challenge = await getTodaysChallenge();
        console.log('Daily challenge loaded:', challenge);
        setActivePrompt(challenge);
      } catch (error) {
        console.error('Error loading daily challenge:', error);
        // Use fallback challenge
        const fallbackChallenge = getFallbackChallenge();
        console.log('Using fallback challenge:', fallbackChallenge);
        setActivePrompt(fallbackChallenge);
      }
    };

    loadDailyChallenge();
  }, []);

  const handleAddText = useCallback(() => {
    setMemeTexts([
      ...memeTexts,
      {
        text: 'New Text',
        position: { x: 50, y: 50 },
      },
    ]);
  }, [memeTexts]);

  const handleUpdateText = useCallback((index: number, text: string) => {
    setMemeTexts(
      memeTexts.map((item, i) =>
        i === index ? { ...item, text } : item
      )
    );
  }, [memeTexts]);

  const handleUpdatePosition = useCallback((index: number, position: { x: number; y: number }) => {
    setMemeTexts(
      memeTexts.map((item, i) =>
        i === index ? { ...item, position } : item
      )
    );
  }, [memeTexts]);

  const handleDeleteText = useCallback((index: number) => {
    setMemeTexts(memeTexts.filter((_, i) => i !== index));
  }, [memeTexts]);

  const handleSelectTemplate = useCallback((templateUrl: string) => {
    setSelectedTemplate(templateUrl);
    setUploadedImage(null);
    setGeneratedImage(null);
  }, []);

  const handleImageUpload = useCallback((imageUrl: string) => {
    setUploadedImage(imageUrl);
    setSelectedTemplate('');
    setGeneratedImage(null);
  }, []);

  const handleUpdateCaption = useCallback((newCaption: string) => {
    setCaption(newCaption);
  }, []);

  const handleSelectCaption = useCallback((selectedCaption: string) => {
    setCaption(selectedCaption);
  }, []);

  const handleGenerateCaptions = useCallback(async () => {
    if (!activePrompt) return;
    
    setIsGeneratingCaptions(true);
    try {
      const captions = await generateCaption(
        activePrompt.text,
        activePrompt.theme || '',
        selectedStyle
      );
      
      if (captions && captions.length > 0) {
        setGeneratedCaptions(captions);
      } else {
        throw new Error('No captions generated');
      }
    } catch (error) {
      console.error('Error generating captions:', error);
      toast({
        title: 'Error generating captions',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingCaptions(false);
    }
  }, [activePrompt, selectedStyle, toast]);

  const handleGenerateImage = useCallback(async () => {
    if (!activePrompt) return;
    
    setIsGeneratingAIImage(true);
    try {
      const imageData = await generateMemeImage(activePrompt.text);
      
      if (imageData) {
        setGeneratedImage(imageData);
        setSelectedTemplate('');
        setUploadedImage(null);
      } else {
        throw new Error('No image generated');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Error generating image',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAIImage(false);
    }
  }, [activePrompt, toast]);

  const handleSaveMeme = useCallback(async (canvasDataUrl: string) => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to save memes',
        variant: 'destructive',
      });
      return;
    }

    if (!activePrompt) {
      toast({
        title: 'No active prompt',
        description: 'Please wait for the prompt to load',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dayOfYear = getCurrentDayOfYear();
      
      const meme = await createMeme({
        prompt: activePrompt.text,
        prompt_id: activePrompt.id,
        imageUrl: canvasDataUrl,
        caption,
        creatorId: user.id,
        tags: activePrompt.tags || [],
        challengeDay: dayOfYear
      });

      if (meme) {
        toast({
          title: 'Meme created!',
          description: 'Your meme has been saved successfully',
        });
      }
    } catch (error) {
      console.error('Error saving meme:', error);
      toast({
        title: 'Error saving meme',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  }, [user, activePrompt, caption, toast]);

  const handleSaveAsTemplate = useCallback((imageUrl: string, promptText: string) => {
    setGeneratedImage(null);
    setUploadedImage(imageUrl);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        {activePrompt && <PromptOfTheDay prompt={activePrompt} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="templates" className="flex-1">Templates</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">AI Generator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Choose a Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <TemplateSelector onSelectTemplate={handleSelectTemplate} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Own Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploader onImageUpload={handleImageUpload} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle>AI Image Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <AiImageGenerator 
                    promptText={activePrompt?.text || ''}
                    isGeneratingAIImage={isGeneratingAIImage}
                    generatedImage={generatedImage}
                    handleGenerateImage={handleGenerateImage}
                    onSaveAsTemplate={handleSaveAsTemplate}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <CaptionGenerator
              promptText={activePrompt?.text || ''}
              selectedStyle={selectedStyle}
              isGeneratingCaptions={isGeneratingCaptions}
              generatedCaptions={generatedCaptions}
              setSelectedStyle={setSelectedStyle}
              handleGenerateCaptions={handleGenerateCaptions}
              handleSelectCaption={handleSelectCaption}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => handleUpdateCaption(e.target.value)}
              placeholder="Enter a caption for your meme"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Meme Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <MemeCanvas 
                templateUrl={selectedTemplate}
                uploadedImage={uploadedImage}
                generatedImage={generatedImage}
                memeTexts={memeTexts}
                caption={caption}
              />
            </CardContent>
          </Card>
          
          <TextEditor
            memeTexts={memeTexts}
            onAddText={handleAddText}
            onUpdateText={handleUpdateText}
            onDeleteText={handleDeleteText}
          />
          
          <SaveActions 
            canSave={!!(selectedTemplate || uploadedImage || generatedImage)}
            onSave={handleSaveMeme}
          />
        </div>
      </div>
    </div>
  );
};

export default MemeGenerator;
