
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeGenerator from '@/components/meme/MemeGenerator';
import { MOCK_PROMPTS } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Create = () => {
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState(MOCK_PROMPTS[0]);
  
  const handleSaveMeme = (meme: { caption: string; imageUrl: string }) => {
    // In a real application, we would upload to Pinata IPFS here
    // and save the data to Supabase
    
    // For the MVP, we'll just show a success message and redirect
    toast.success('Meme created successfully!', {
      description: 'Your meme has been published to the feed.',
    });
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <h1 className="text-3xl font-heading mb-6">Create Your Meme</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-background border rounded-xl p-4 shadow-sm sticky top-20">
              <h2 className="text-xl font-heading mb-4">Prompts</h2>
              
              <Tabs defaultValue="challenge">
                <TabsList className="w-full">
                  <TabsTrigger value="challenge" className="flex-1">Daily Challenge</TabsTrigger>
                  <TabsTrigger value="custom" className="flex-1">Custom</TabsTrigger>
                </TabsList>
                
                <TabsContent value="challenge" className="pt-4">
                  <div className="space-y-2">
                    {MOCK_PROMPTS.map(prompt => (
                      <div 
                        key={prompt.id} 
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedPrompt.id === prompt.id 
                            ? 'bg-brand-purple text-white' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                        onClick={() => setSelectedPrompt(prompt)}
                      >
                        <p className="font-medium">{prompt.text}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prompt.tags.map(tag => (
                            <span 
                              key={tag} 
                              className={`text-xs px-2 rounded-full ${
                                selectedPrompt.id === prompt.id 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-background'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="pt-4">
                  <p className="text-muted-foreground mb-3">
                    Enter your own prompt to create a custom meme. Let your creativity run wild!
                  </p>
                  
                  <div className="p-4 border border-dashed rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Coming soon!</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <h3 className="font-heading text-lg mb-2">Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>Use the AI caption generator for inspiration</li>
                  <li>Choose a template that best fits your idea</li>
                  <li>Keep captions short and punchy</li>
                  <li>Enter battles to gain more visibility</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 order-1 lg:order-2">
            <MemeGenerator 
              promptText={selectedPrompt.text} 
              onSave={handleSaveMeme}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Create;
