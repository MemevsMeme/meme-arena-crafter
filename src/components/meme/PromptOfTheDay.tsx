
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Prompt } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PromptOfTheDayProps {
  prompt?: Prompt | null; // Accept Prompt object or null
  isLoading?: boolean;
}

const PromptOfTheDay = ({ 
  prompt,
  isLoading = false 
}: PromptOfTheDayProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Store the actual prompt to display
  const [displayPrompt, setDisplayPrompt] = useState<Prompt | null>(null);

  // Handle prompt loading and ensure we always have a valid prompt to display
  useEffect(() => {
    if (prompt) {
      // If we have a prompt from props (database), use it
      setDisplayPrompt(prompt);
    }
  }, [prompt, isLoading]);

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

  // If somehow we don't have a prompt, show a message
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
      
      // Store prompt in localStorage with a clear naming convention
      const simplifiedPrompt = {
        text: displayPrompt.text,
        id: displayPrompt.id,
        tags: displayPrompt.tags || []
      };
      
      localStorage.setItem('active_challenge_prompt', JSON.stringify(simplifiedPrompt));
      console.log('Challenge prompt stored in localStorage with key: active_challenge_prompt');
      
      // Navigate to create page for authenticated users
      navigate('/create');
    } catch (error) {
      console.error("Error accepting challenge:", error);
      toast.error("Failed to accept challenge. Please try again.");
    }
  };
  
  const handleLoginRedirect = () => {
    toast.info("Please sign in to accept this challenge");
    
    // Save where the user was trying to go
    localStorage.setItem('returnUrl', '/create');
    
    // Navigate to login
    navigate('/login');
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
        
        {user ? (
          <Button 
            className="gap-1 bg-white text-brand-purple hover:bg-white/90"
            onClick={handleAcceptChallenge}
          >
            Accept Challenge
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="gap-1 border border-white/50 bg-white/10 hover:bg-white/20"
            onClick={handleLoginRedirect}
          >
            Sign in to Accept
            <LogIn className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PromptOfTheDay;
