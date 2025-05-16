
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

interface Template {
  id: string;
  name: string;
  url: string;
  textPositions: { x: number; y: number }[];
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Drake",
    url: "https://i.imgflip.com/30b5v.jpg",
    textPositions: [{ x: 0.25, y: 0.25 }, { x: 0.75, y: 0.75 }],
  },
  {
    id: "2",
    name: "Distracted Boyfriend",
    url: "https://i.imgflip.com/1bij.jpg",
    textPositions: [{ x: 0.2, y: 0.8 }, { x: 0.5, y: 0.2 }, { x: 0.8, y: 0.8 }],
  },
  {
    id: "3",
    name: "Change My Mind",
    url: "https://i.imgflip.com/24y43o.jpg",
    textPositions: [{ x: 0.5, y: 0.8 }],
  },
];

const Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = useState('');
  const [promptId, setPromptId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(defaultTemplates[0]);
  const [editMode, setEditMode] = useState(false);
  const [isGeneratingAIImage, setIsGeneratingAIImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is authenticated
    if (!user) {
      // Redirect to the login page
      toast.error('You must be logged in to create memes.');
      navigate('/login', { replace: true });
      return;
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

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

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
    // Add the generated image to available templates
    const newTemplate: Template = {
      id: `ai-${Date.now()}`,
      name: "AI Generated",
      url: imageUrl,
      textPositions: [{ x: 0.5, y: 0.8 }],
    };
    
    // Select the new template
    setSelectedTemplate(newTemplate);
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

      <main className="flex-grow w-full px-4 py-8 bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-4xl mx-auto shadow-lg mb-16">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading">Create a Meme</CardTitle>
            <CardDescription>Unleash your creativity and make the world laugh!</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template">Select a Template</Label>
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                  {defaultTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate.id === template.id ? 'default' : 'outline'}
                      onClick={() => handleTemplateSelect(template)}
                      size={isMobile ? "sm" : "default"}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
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
            </div>

            <Separator className="my-4" />

            {/* AI Image Generator - Compact for mobile */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Generate AI Image</h3>
              <AiImageGenerator
                promptText={prompt}
                isGeneratingAIImage={isGeneratingAIImage}
                generatedImage={generatedImage}
                handleGenerateImage={handleGenerateImage}
                onSaveAsTemplate={(imageUrl) => handleSaveAsTemplate(imageUrl)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Separate card for MemeGenerator to prevent layout issues */}
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-0">
            <MemeGenerator 
              promptData={promptData} 
              battleId={null} 
              memeId={null} 
            />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 p-4">
            <Separator />
            <div className="text-center text-sm">
              <Button variant="link" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Create;
