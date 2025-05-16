import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
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
  const [prompt, setPrompt] = useState('');
  const [promptId, setPromptId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(defaultTemplates[0]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    if (!user) {
      // Redirect to the login page
      toast.error('You must be logged in to create memes.');
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSaveMeme = async (meme: { id: string; caption: string; imageUrl: string }) => {
    // Placeholder for saving the meme
    console.log('Meme saved:', meme);
    toast.success('Meme saved successfully!');
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-4xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading">Create a Meme</CardTitle>
            <CardDescription>Unleash your creativity and make the world laugh!</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template">Select a Template</Label>
                <div className="flex flex-wrap gap-2">
                  {defaultTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate.id === template.id ? 'default' : 'outline'}
                      onClick={() => handleTemplateSelect(template)}
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

            {/* Meme Generator */}
            <MemeGenerator promptData={{ id: promptId, text: prompt, tags: [] }} battleId={null} memeId={null} />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Separator />

            <div className="text-center text-sm">
              <Button variant="link" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Create;
