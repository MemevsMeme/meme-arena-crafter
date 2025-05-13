import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeGenerator from '@/components/meme/MemeGenerator';
import { getPromptById, createMeme, getCurrentDayOfYear } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { Prompt } from '@/lib/types';
import { getFallbackChallenge } from '@/lib/dailyChallenges';

const Create = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Get prompt ID from URL or state
  const promptIdFromUrl = searchParams.get('promptId');
  const statePrompt = location.state?.challengePrompt as Prompt | undefined;
  
  // Determine if this is for a daily challenge
  const [isForDailyChallenge, setIsForDailyChallenge] = useState<boolean>(false);
  const [isBattleSubmission, setIsBattleSubmission] = useState<boolean>(false);
  
  // Fetch prompt if promptId is provided
  const { data: promptFromDb, isLoading: promptLoading } = useQuery({
    queryKey: ['prompt', promptIdFromUrl],
    queryFn: async () => {
      if (promptIdFromUrl) {
        try {
          return await getPromptById(promptIdFromUrl);
        } catch (error) {
          console.error('Error fetching prompt:', error);
          return null;
        }
      }
      return null;
    },
    enabled: !!promptIdFromUrl && !statePrompt,
  });
  
  // Determine the prompt to use
  const prompt = statePrompt || promptFromDb || null;
  
  // Set flags for daily challenge and battle submission
  useEffect(() => {
    if (prompt) {
      setIsForDailyChallenge(!!prompt.challengeDay);
      setIsBattleSubmission(!!promptIdFromUrl || !!statePrompt);
    }
  }, [prompt, promptIdFromUrl, statePrompt]);
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      toast.error('You need to be logged in to create memes');
      navigate('/login', { state: { returnPath: location.pathname + location.search } });
    }
  }, [user, navigate, location]);
  
  // Handle successful meme creation
  const handleMemeCreated = (meme: { id: string; caption: string; imageUrl: string }) => {
    toast.success('Meme created successfully!');
    
    if (isBattleSubmission) {
      // If created for a battle, navigate to battles page
      navigate('/battles');
    } else {
      // Otherwise navigate to the meme detail page (if you have one)
      navigate(`/meme/${meme.id}`);
    }
  };

  if (promptLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // If we need a prompt but don't have one, use fallback
  const fallbackPrompt = prompt || getFallbackChallenge();
  const currentDayOfYear = getCurrentDayOfYear();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading mb-6">Create A Meme</h1>
          
          {user ? (
            <MemeGenerator 
              promptText={fallbackPrompt.text}
              promptId={fallbackPrompt.id}
              onSave={handleMemeCreated}
              isBattleSubmission={isBattleSubmission}
              challengeDay={isForDailyChallenge ? currentDayOfYear : undefined}
              battleId={promptIdFromUrl}
            />
          ) : (
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="mb-4">Please log in to create memes.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Create;
