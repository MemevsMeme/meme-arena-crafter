
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Prompt } from '@/lib/types';
import { getFallbackChallenge } from '@/lib/dailyChallenges';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  // Always get a default prompt from our local challenges in case the database query fails
  const defaultPrompt = getFallbackChallenge();
  const [isImporting, setIsImporting] = useState(false);

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
      
      // Check if user is logged in before proceeding
      if (!user) {
        console.log('User not logged in, redirecting to login');
        navigate('/login');
        return;
      }
      
      // Store prompt in localStorage with a clear naming convention
      const simplifiedPrompt = {
        text: displayPrompt.text,
        id: displayPrompt.id,
        tags: displayPrompt.tags || []
      };
      
      localStorage.setItem('active_challenge_prompt', JSON.stringify(simplifiedPrompt));
      console.log('Challenge prompt stored in localStorage with key: active_challenge_prompt');
      
      // Navigate to create page
      navigate('/create');
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

  // Function to import daily challenges from our static file to Supabase
  // This would usually be in an admin panel, but for development it's here
  const importDailyChallenges = async () => {
    if (!user) return;
    
    try {
      setIsImporting(true);
      
      // Import the challenges module
      const { DAILY_CHALLENGES } = await import('@/lib/dailyChallenges');
      
      // Format the challenges for database storage
      const challengesForDb = DAILY_CHALLENGES.map((challenge, index) => {
        // Extract the day number from the ID (e.g., 'jan-01' -> 1, 'feb-15' -> 46)
        let dayOfYear = index + 1; // Default to index+1 if we can't parse
        
        // Try to parse the ID to get a more accurate day of year
        const idMatch = challenge.id.match(/([a-z]+)-(\d+)/);
        if (idMatch && idMatch.length === 3) {
          const month = idMatch[1].toLowerCase();
          const day = parseInt(idMatch[2]);
          
          // Map month to its numerical value
          const monthMap: {[key: string]: number} = {
            'jan': 0, 'feb': 31, 'mar': 59, 'apr': 90, 
            'may': 120, 'jun': 151, 'jul': 181, 'aug': 212, 
            'sep': 243, 'oct': 273, 'nov': 304, 'dec': 334
          };
          
          if (monthMap[month] !== undefined) {
            dayOfYear = monthMap[month] + day;
          }
        }
        
        return {
          text: challenge.text,
          theme: challenge.theme || null,
          tags: challenge.tags || [],
          day_of_year: dayOfYear
        };
      });
      
      // Call our edge function to import the challenges
      const { data, error } = await supabase.functions.invoke('import-daily-challenges', {
        body: { challenges: challengesForDb },
      });
      
      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error during import');
      }
      
      toast({
        title: "Challenges imported",
        description: `Successfully imported challenges: ${data.added} added, ${data.total} total.`,
      });
      
      console.log('Import successful:', data);
    } catch (error) {
      console.error('Error importing daily challenges:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import challenges",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Check if the user is an admin (this should be a more robust check in production)
  // For development, checking if the user is logged in is enough to show the admin button
  const isAdmin = user !== null;

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
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={importDailyChallenges}
              disabled={isImporting}
            >
              <Cloud className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import Challenges'}
            </Button>
          )}
          <Button 
            className="gap-1 bg-white text-brand-purple hover:bg-white/90"
            onClick={handleAcceptChallenge}
          >
            Accept Challenge
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptOfTheDay;
