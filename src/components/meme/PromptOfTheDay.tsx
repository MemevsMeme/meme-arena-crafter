
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Prompt } from '@/lib/types';
import { MOCK_PROMPTS } from '@/lib/constants';

interface PromptOfTheDayProps {
  prompt?: Prompt;
  isLoading?: boolean;
}

const PromptOfTheDay = ({ 
  prompt = MOCK_PROMPTS[0], 
  isLoading = false 
}: PromptOfTheDayProps) => {
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

  if (!prompt) {
    return (
      <div className="prompt-card bg-muted">
        <h3 className="text-lg font-medium mb-1">No Active Prompt</h3>
        <p className="text-2xl font-bold mb-4">Check back soon for today's challenge!</p>
      </div>
    );
  }

  return (
    <div className="prompt-card animate-float">
      <h3 className="text-lg font-medium mb-1">Today's Meme Challenge</h3>
      <p className="text-2xl font-bold mb-4">{prompt.text}</p>
      <div className="flex justify-between items-center">
        <div className="flex gap-1 flex-wrap">
          {prompt.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
        <Link to="/create">
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
