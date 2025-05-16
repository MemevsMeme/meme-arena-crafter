
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeGenerator from '@/components/meme/MemeGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { Prompt } from '@/lib/types';
import AiImageGenerator from '@/components/meme/AiImageGenerator';
import { generateMemeImage } from '@/lib/ai';
import { useIsMobile } from '@/hooks/use-mobile';
import TemplateSelector from '@/components/meme/TemplateSelector';
import { MEME_TEMPLATES } from '@/lib/constants';

const Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = useState('');
  const [promptId, setPromptId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(MEME_TEMPLATES[0]);
  const [isGeneratingAIImage, setIsGeneratingAIImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is authenticated
    if (!user) {
      // Redirect to the login page
      toast.error('You must be logged in to create memes.');
      navigate('/login', { replace: true });
    }
    
    // Check for daily challenge in localStorage
    const storedChallengePrompt = localStorage.getItem('active_challenge_prompt');
    if (storedChallengePrompt) {
      try {
        const parsedPrompt = JSON.parse(storedChallengePrompt);
        if (parsedPrompt && parsedPrompt.text) {
          setPrompt(parsedPrompt.text);
          if (parsedPrompt.id) {
            setPromptId(parsedPrompt.id);
          }
        }
      } catch (e) {
        console.error('Error parsing stored challenge:', e);
      }
    }
  }, [user, navigate]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleGenerateImage = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt first");
      return;
    }
    
    setIsGeneratingAIImage(true);
    
    try {
      const imageData = await generateMemeImage(prompt, "meme");
      if (imageData) {
        setGeneratedImage(imageData);
        toast.success("AI image generated successfully!");
      } else {
        toast.error("Failed to generate image");
      }
    } catch (error: any) {
      console.error("Error generating AI image:", error);
      toast.error(`Failed to generate image: ${error.message || "Unknown error"}`);
    } finally {
      setIsGeneratingAIImage(false);
    }
  };

  const handleSaveAsTemplate = (imageUrl: string) => {
    // Create a new template from the generated image
    const newTemplate = {
      id: `ai-${Date.now()}`,
      name: "AI Generated",
      url: imageUrl,
      textPositions: [{ 
        x: 50, 
        y: 25, 
        fontSize: 24, 
        maxWidth: 300, 
        alignment: "center" 
      }],
    };
    
    // Select the new template
    setSelectedTemplate(newTemplate);
    
    // Store the image URL in localStorage for the MemeGenerator component
    localStorage.setItem('meme_image', imageUrl);
  };

  // Create a proper Prompt object
  const promptData: Prompt = {
    id: promptId,
    text: prompt,
    theme: null,
    tags: [],
    active: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow w-full px-4 py-6 bg-gradient-to-b from-background to-muted/30">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold font-heading">Create a Meme</h1>
            <p className="text-muted-foreground">Unleash your creativity and make the world laugh!</p>
          </div>
          
          {/* Top Options Card */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Choose a template or generate an image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template">Select a Template</Label>
                <TemplateSelector 
                  selectedTemplate={selectedTemplate} 
                  setSelectedTemplate={setSelectedTemplate} 
                />
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Enter a Prompt</Label>
                <Input
                  id="prompt"
                  placeholder="e.g., When you realize it's Monday again"
                  value={prompt}
                  onChange={handlePromptChange}
                />
              </div>

              {/* AI Image Generator - Compact for mobile */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Generate AI Image</h3>
                <AiImageGenerator
                  promptText={prompt}
                  isGeneratingAIImage={isGeneratingAIImage}
                  generatedImage={generatedImage}
                  handleGenerateImage={handleGenerateImage}
                  onSaveAsTemplate={handleSaveAsTemplate}
                />
              </div>
            </CardContent>
          </Card>

          {/* Meme Generator in its own card */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Meme Generator</CardTitle>
              <CardDescription>Design your meme with captions and effects</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <div className="h-full">
                <MemeGenerator 
                  promptData={promptData} 
                  battleId={null} 
                  memeId={null}
                  selectedTemplate={selectedTemplate}
                  generatedImage={generatedImage} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Create;
