
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  // Always get a default prompt from our local challenges in case the database query fails
  // This is synchronous and returns a plain Prompt object
  const defaultPrompt = getFallbackChallenge();

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

  // If no prompt is provided from the database, use our local default
  const promptToShow = prompt || defaultPrompt;

  if (!promptToShow) {
    // This should rarely happen since we have a local fallback
    return (
      <div className="prompt-card bg-muted">
        <h3 className="text-lg font-medium mb-1">No Active Prompt</h3>
        <p className="text-2xl font-bold mb-4">Check back soon for today's challenge!</p>
      </div>
    );
  }

  const isOfficialChallenge = promptToShow.challengeDay !== undefined;

  return (
    <div className="prompt-card animate-float">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-medium">Today's Meme Challenge</h3>
        {isOfficialChallenge && (
          <span className="px-2 py-0.5 bg-brand-purple/20 text-brand-purple rounded-full text-xs font-medium">
            Official
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mb-4">{promptToShow.text}</p>
      <div className="flex justify-between items-center">
        <div className="flex gap-1 flex-wrap">
          {promptToShow.tags && promptToShow.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
        <Link to="/create" state={{ challengePrompt: promptToShow }}>
          <Button className="gap-1 bg-white text-brand-purple hover:bg-white/90">
            Accept Challenge
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PromptOfTheDay;
