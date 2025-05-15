
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeGenerator from '@/components/meme/MemeGenerator';
import { Prompt } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { MEME_TEMPLATES } from '@/lib/constants';
import { safeJsonParse } from '@/lib/utils';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const Create = () => {
  const navigate = useNavigate();
  const { user, loading, session } = useAuth();
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createdMeme, setCreatedMeme] = useState<{ id: string; caption: string; imageUrl: string } | null>(null);
  
  const [defaultEditMode] = useState<boolean>(false);
  const [defaultTemplate] = useState(MEME_TEMPLATES[0]);
  const [authChecked, setAuthChecked] = useState(false);

  // Improved auth check with protection against looping
  useEffect(() => {
    // Skip if we've already completed the auth check
    if (authChecked) return;
    
    // If auth is still loading, wait
    if (loading) return;
    
    // Mark auth check as completed
    setAuthChecked(true);
    
    // If not authenticated after loading completes, redirect to login
    if (!session && !loading) {
      console.log('User not authenticated, redirecting to login');
      try {
        localStorage.setItem('returnUrl', '/create');
      } catch (err) {
        console.error('Failed to set localStorage:', err);
      }
      navigate('/login');
      return;
    }
    
    // Once authenticated, load prompt
    loadPrompt();
  }, [loading, session, navigate, authChecked]);

  const loadPrompt = () => {
    try {
      // Look for challenge prompt in localStorage
      let storedPromptData;
      try {
        storedPromptData = localStorage.getItem('active_challenge_prompt');
      } catch (err) {
        console.error('Failed to access localStorage:', err);
      }
      
      if (storedPromptData) {
        console.log('Found stored prompt data:', storedPromptData);
        const promptData = safeJsonParse(storedPromptData, null);
        
        if (promptData && promptData.text) {
          console.log('Setting active prompt from localStorage data');
          
          // Generate a valid UUID if the ID isn't already a valid UUID
          let promptId = promptData.id;
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(promptId)) {
            // If the ID isn't a UUID, generate a new one
            promptId = uuidv4();
            console.log('Generated new UUID for prompt:', promptId);
          }
          
          setActivePrompt({
            id: promptId,
            text: promptData.text,
            tags: promptData.tags || [],
            active: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            theme: ''
          });
          
          // Remove from localStorage to prevent future issues
          try {
            localStorage.removeItem('active_challenge_prompt');
          } catch (err) {
            console.error('Failed to remove from localStorage:', err);
          }
        } else {
          console.log('Using fallback prompt (stored prompt invalid)');
          setFallbackPrompt();
        }
      } else {
        console.log('No stored prompt found, using fallback');
        setFallbackPrompt();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing prompt data:', error);
      setFallbackPrompt();
      setIsLoading(false);
    }
  };

  const setFallbackPrompt = () => {
    setActivePrompt({
      id: uuidv4(), // Always use a valid UUID for fallback
      text: 'Create a funny meme!',
      theme: 'humor',
      tags: ['funny', 'meme'],
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000)
    });
  };

  const handleMemeSave = async (meme: { id: string; caption: string; imageUrl: string }) => {
    console.log('Meme created successfully:', meme);
    setCreatedMeme(meme);
    
    toast("Meme Created!", {
      description: "Your meme has been successfully saved."
    });
    
    // Navigate to the meme profile page after a short delay
    setTimeout(() => {
      if (user) {
        navigate(`/profile/${user.id}`);
      }
    }, 2000);
  };

  // Show loading state while authentication is being checked
  if (loading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not authenticated, redirection is handled in useEffect
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-lg font-medium text-yellow-800">Authentication Required</h2>
            <p className="text-sm text-yellow-700">Please login to create memes. You'll be redirected shortly...</p>
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
              promptText={activePrompt?.text || 'Create a funny meme!'} 
              promptId={activePrompt?.id}
              onSave={handleMemeSave}
              defaultEditMode={defaultEditMode}
              defaultTemplate={defaultTemplate}
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-background border rounded-xl p-4 shadow-sm">
              <h2 className="text-xl font-heading mb-4">Tips for Creating Great Memes</h2>
              
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-brand-purple font-bold">1.</span>
                  <span>Keep your captions concise and punchy (or leave blank for image-only memes)</span>
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
