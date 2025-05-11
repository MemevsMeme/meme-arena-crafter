import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeGenerator from '@/components/meme/MemeGenerator';
import { getActivePrompt } from '@/lib/database';
import { Prompt } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Create = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdMeme, setCreatedMeme] = useState<{ id: string; caption: string; imageUrl: string } | null>(null);
  
  // Add state for default edit mode
  const [defaultEditMode] = useState<boolean>(true);

  useEffect(() => {
    const fetchActivePrompt = async () => {
      setLoading(true);
      try {
        const prompt = await getActivePrompt();
        setActivePrompt(prompt);
      } catch (error) {
        console.error('Error fetching active prompt:', error);
        toast({
          title: "Error",
          description: "Failed to load today's challenge",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivePrompt();
  }, []);

  const handleMemeSave = (meme: { id: string; caption: string; imageUrl: string }) => {
    console.log('Meme created successfully:', meme);
    setCreatedMeme(meme);
    
    toast({
      title: "Success",
      description: "Meme created successfully!"
    });
    
    // Navigate to the meme battle page or profile after a short delay
    setTimeout(() => {
      if (user) {
        navigate(`/profile/${user.id}`);
      }
    }, 2000);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center p-10 bg-muted rounded-lg">
            <h2 className="text-2xl font-heading mb-4">Login Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to create memes.
            </p>
            <button 
              className="bg-brand-purple text-white px-6 py-2 rounded-md"
              onClick={() => navigate('/login')}
            >
              Login / Register
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-heading mb-6">Create a Meme</h1>
        
        {createdMeme && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <h2 className="text-xl font-heading text-green-800 mb-2">Meme Created!</h2>
            <p className="mb-2">Your meme has been successfully created and saved.</p>
            <div className="flex justify-between items-center">
              <span>You will be redirected to your profile...</span>
              <button 
                className="bg-brand-purple text-white px-4 py-1 rounded-md text-sm"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MemeGenerator 
              promptText={activePrompt?.text || ''} 
              promptId={activePrompt?.id}
              onSave={handleMemeSave}
              defaultEditMode={defaultEditMode}
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-background border rounded-xl p-4 shadow-sm">
              <h2 className="text-xl font-heading mb-4">Tips for Creating Great Memes</h2>
              
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-brand-purple font-bold">1.</span>
                  <span>Keep your captions concise and punchy</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-purple font-bold">2.</span>
                  <span>Match your caption style to the template</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-purple font-bold">3.</span>
                  <span>Use the AI generator for inspiration</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-purple font-bold">4.</span>
                  <span>Preview your meme before submitting</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-purple font-bold">5.</span>
                  <span>Be original and creative with your ideas</span>
                </li>
              </ul>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">How Meme Battles Work</h3>
                <p className="text-sm text-muted-foreground">
                  After creating a meme, it will enter the battle queue. Your meme will be paired with another user's creation, and the community will vote for their favorite. Win battles to earn XP and climb the leaderboard!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Create;
