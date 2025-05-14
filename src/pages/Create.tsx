import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeGenerator from '@/components/meme/MemeGenerator';
import { Prompt } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { MEME_TEMPLATES } from '@/lib/constants';
import { safeJsonParse } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createdMeme, setCreatedMeme] = useState<{ id: string; caption: string; imageUrl: string } | null>(null);
  
  const [defaultEditMode] = useState<boolean>(false);
  const [defaultTemplate] = useState(MEME_TEMPLATES[0]);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Track if this navigation came from accepting a challenge
  const fromChallenge = location.state?.fromChallenge === true;

  console.log('Create component rendered, Auth status:', { user, loading, hasInitialized, fromChallenge });

  // Modified to prevent infinite loops
  useEffect(() => {
    // Only proceed with initialization after auth check is complete and not yet initialized
    if (loading || hasInitialized) return;

    console.log('Create component initializing, Auth status:', { user, loading, fromChallenge });
    
    // If user is not authenticated, redirect to login
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    // Mark as initialized to prevent multiple runs
    setHasInitialized(true);
    
    console.log('User is authenticated, checking for challenge prompt');
    
    // Look for prompt in sessionStorage
    const storedPromptData = sessionStorage.getItem('challenge_prompt');
    
    if (storedPromptData) {
      try {
        console.log('Found prompt data in sessionStorage:', storedPromptData);
        const promptData = safeJsonParse(storedPromptData, null);
        
        if (promptData && promptData.text) {
          // Create a complete prompt object
          const sessionPrompt: Prompt = {
            id: promptData.id || 'temp-id',
            text: promptData.text,
            tags: promptData.tags || [],
            active: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            theme: ''
          };
          
          console.log('Setting active prompt from sessionStorage:', sessionPrompt);
          setActivePrompt(sessionPrompt);
          
          // Clear session storage after using it to prevent future issues
          sessionStorage.removeItem('challenge_prompt');
        } else {
          console.log('Prompt data is missing text field:', promptData);
          setFallbackPrompt();
        }
      } catch (error) {
        console.error('Error parsing stored prompt data:', error);
        setFallbackPrompt();
      }
    } else {
      console.log('No prompt data found in sessionStorage, using fallback');
      setFallbackPrompt();
    }
    
    setIsLoading(false);
  }, [user, loading, navigate, hasInitialized, fromChallenge]);

  // Clear navigation state when component unmounts to prevent future issues
  useEffect(() => {
    return () => {
      if (fromChallenge && location.state?.fromChallenge) {
        // This helps prevent the location state from persisting
        window.history.replaceState({}, document.title);
      }
    };
  }, [fromChallenge, location.state]);

  const setFallbackPrompt = () => {
    setActivePrompt({
      id: 'fallback',
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
    
    try {
      // Verify the meme was actually saved in the database
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('id', meme.id)
        .single();
      
      if (error) {
        console.error('Error verifying meme in database:', error);
        toast({
          title: "Database Error",
          description: "There was an issue confirming your meme was saved. Please check your profile.",
          variant: "destructive"
        });
      } else if (data) {
        console.log('Meme confirmed in database:', data);
        setCreatedMeme(meme);
        
        // Navigate to the meme profile page after a short delay
        setTimeout(() => {
          if (user) {
            navigate(`/profile/${user.id}`, { replace: true });
          }
        }, 2000);
      } else {
        console.error('Meme not found in database after creation');
        toast({
          title: "Save Error",
          description: "Your meme couldn't be found in the database. Please try again.",
          variant: "destructive"
        });
      }
    } catch (verifyError) {
      console.error('Exception verifying meme save:', verifyError);
    }
  };

  // Show loading state while authentication is being checked
  if (loading) {
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

  // Redirect handled in useEffect to avoid rendering issues
  if (!user) {
    return null;
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
