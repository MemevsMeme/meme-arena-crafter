
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Prompt } from '@/lib/types';
import { getFallbackChallenge } from '@/lib/dailyChallenges';

interface PromptOfTheDayProps {
  prompt?: Prompt | null; // Accept Prompt object or null
  isLoading?: boolean;
}

const PromptOfTheDay = ({ 
  prompt,
  isLoading = false 
}: PromptOfTheDayProps) => {
  const navigate = useNavigate();
  // Always get a default prompt from our local challenges in case the database query fails
  const defaultPrompt = getFallbackChallenge();

  // Store the actual prompt to display
  const [displayPrompt, setDisplayPrompt] = useState<Prompt | null>(null);

  // Handle prompt loading and ensure we always have a valid prompt to display
  useEffect(() => {
    if (prompt) {
      // If we have a prompt from props (database), use it
      setDisplayPrompt(prompt);
    } else if (!isLoading) {
      // If we're not loading and don't have a prompt, use the fallback
      setDisplayPrompt(defaultPrompt);
    }
  }, [prompt, isLoading, defaultPrompt]);

  if (isLoading) {
    return (
      <div className="prompt-card animate-pulse bg-muted">
        <div className="h-6 w-3/4 bg-muted-foreground/20 rounded mb-2"></div>
        <div className="h-10 w-full bg-muted-foreground/20 rounded mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-muted-foreground/20 rounded"></div>
            ))}
          </div>
          <div className="h-10 w-32 bg-muted-foreground/20 rounded"></div>
        </div>
      </div>
    );
  }

  // If somehow we still don't have a prompt, show a message
  if (!displayPrompt) {
    return (
      <div className="prompt-card bg-muted">
        <h3 className="text-lg font-medium mb-1">No Active Prompt</h3>
        <p className="text-2xl font-bold mb-4">Check back soon for today's challenge!</p>
      </div>
    );
  }

  const handleAcceptChallenge = () => {
    try {
      console.log('Accepting challenge with prompt:', displayPrompt.text);
      
      // Store prompt directly in localStorage instead of sessionStorage to be more persistent
      const simplifiedPrompt = {
        text: displayPrompt.text,
        id: displayPrompt.id,
        tags: displayPrompt.tags || []
      };
      
      localStorage.setItem('challenge_prompt', JSON.stringify(simplifiedPrompt));
      console.log('Challenge prompt stored successfully in localStorage');
      
      // Navigate directly to the create page with replace: true to avoid browser history issues
      navigate('/create', { replace: true });
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

  return (
    <div className="prompt-card animate-float">
      <h3 className="text-lg font-medium mb-1">Today's Meme Challenge</h3>
      <p className="text-2xl font-bold mb-4">{displayPrompt.text}</p>
      <div className="flex justify-between items-center">
        <div className="flex gap-1 flex-wrap">
          {displayPrompt.tags && displayPrompt.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
        <Button 
          className="gap-1 bg-white text-brand-purple hover:bg-white/90"
          onClick={handleAcceptChallenge}
        >
          Accept Challenge
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PromptOfTheDay;
