
import { supabase } from '@/integrations/supabase/client';
import { DAILY_CHALLENGES } from '../challenges/index';
import { getCurrentDayOfYear } from './prompts';
import { toast } from '@/components/ui/use-toast';

/**
 * Transfers local daily challenges to the Supabase database
 * @returns Object containing success status and count of transferred challenges
 */
export async function transferDailyChallenges(): Promise<{
  success: boolean;
  transferred: number;
  errors: number;
}> {
  try {
    let transferred = 0;
    let errors = 0;
    
    // Process challenges in batches to avoid overwhelming the database
    const batchSize = 10;
    const batches = [];
    
    // Create batches of challenges
    for (let i = 0; i < DAILY_CHALLENGES.length; i += batchSize) {
      batches.push(DAILY_CHALLENGES.slice(i, i + batchSize));
    }
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const challengesData = batch.map((challenge, index) => {
        // Calculate day of year based on position in array
        // This is a simple approach - you may want a more sophisticated mapping
        const dayOfYear = batchIndex * batchSize + index + 1; // 1-based index
        
        return {
          text: challenge.text,
          theme: challenge.theme || null,
          tags: challenge.tags || [],
          day_of_year: dayOfYear
        };
      });
      
      // Insert batch into Supabase
      const { data, error } = await supabase
        .from('daily_challenges')
        .upsert(challengesData, { 
          onConflict: 'day_of_year',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error transferring batch ${batchIndex}:`, error);
        errors += batch.length;
      } else {
        transferred += batch.length;
        console.log(`Successfully transferred batch ${batchIndex} (${batch.length} challenges)`);
      }
    }
    
    return { 
      success: errors === 0,
      transferred,
      errors
    };
  } catch (error) {
    console.error('Error transferring daily challenges:', error);
    return {
      success: false,
      transferred: 0,
      errors: DAILY_CHALLENGES.length
    };
  }
}

/**
 * Admin function to transfer all daily challenges to Supabase
 * This should be called from an admin panel or similar
 */
export async function transferAllChallenges() {
  const result = await transferDailyChallenges();
  
  if (result.success) {
    toast({
      title: "Transfer Successful",
      description: `Successfully transferred ${result.transferred} challenges to Supabase.`,
      variant: "default",
    });
  } else {
    toast({
      title: "Transfer Incomplete",
      description: `Transferred: ${result.transferred}, Errors: ${result.errors}`,
      variant: "destructive",
    });
  }
  
  return result;
}

/**
 * Creates a new daily challenge entry in Supabase
 */
export async function createDailyChallenge(challenge: {
  text: string;
  theme?: string;
  tags?: string[];
  day_of_year: number;
}) {
  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .upsert({
        text: challenge.text,
        theme: challenge.theme || null,
        tags: challenge.tags || [],
        day_of_year: challenge.day_of_year
      }, { 
        onConflict: 'day_of_year',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error creating daily challenge:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createDailyChallenge:', error);
    return null;
  }
}
