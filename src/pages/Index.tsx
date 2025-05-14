
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PromptOfTheDay from '@/components/meme/PromptOfTheDay';
import MemeCard from '@/components/meme/MemeCard';
import BattleCard from '@/components/battle/BattleCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getActiveBattles, getTrendingMemes, getNewestMemes, getDailyChallenge } from '@/lib/database';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [activeFeedTab, setActiveFeedTab] = useState<string>('trending');
  const { user } = useAuth();
  
  // Setup query for active prompt with better error handling
  const { data: activePrompt, isLoading: promptLoading } = useQuery({
    queryKey: ['activePrompt'],
    queryFn: getDailyChallenge
  });
  
  // Query for recent battles
  const { data: recentBattles, isLoading: battlesLoading } = useQuery({
    queryKey: ['recentBattles'],
    queryFn: async () => {
      try {
        return await getActiveBattles(3, 0, 'all');
      } catch (error) {
        console.error('Failed to fetch recent battles:', error);
        return [];
      }
    }
  });
  
  // Query for memes based on active tab with better error handling
  const { data: memes, isLoading: memesLoading } = useQuery({
    queryKey: ['memes', activeFeedTab],
    queryFn: async () => {
      try {
        if (activeFeedTab === 'trending') {
          return await getTrendingMemes(12);
        } else if (activeFeedTab === 'newest') {
          return await getNewestMemes(12);
        } else {
          // For 'following' tab, get memes from followed users
          // This would require additional backend support
          // For now, just return empty array
          return [];
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeFeedTab} memes:`, error);
        return [];
      }
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Prompts and battles */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <section>
              <h2 className="text-2xl font-heading mb-3">Today's Challenge</h2>
              <PromptOfTheDay 
                prompt={activePrompt}
                isLoading={promptLoading} 
              />
            </section>
            
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-heading">Live Battles</h2>
                <Button variant="link" className="text-sm" asChild>
                  <Link to="/battles">View all</Link>
                </Button>
              </div>
              
              {battlesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-36 bg-muted animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBattles && recentBattles.length > 0 ? (
                    recentBattles.map((battle) => (
                      <BattleCard key={battle.id} battle={battle} compact />
                    ))
                  ) : (
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <p className="text-muted-foreground">No active battles. Create a meme to start one!</p>
                      {user && (
                        <Link to="/create" className="mt-2 inline-block">
                          <Button size="sm">Create Meme</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
          
          {/* Right column - Meme feed */}
          <div className="lg:col-span-2">
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-heading">Meme Feed</h2>
                
                <Tabs value={activeFeedTab} onValueChange={setActiveFeedTab} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="trending">Trending</TabsTrigger>
                    <TabsTrigger value="newest">Newest</TabsTrigger>
                    <TabsTrigger value="following">Following</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {memesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : (
                <>
                  {memes && memes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {memes.map(meme => (
                        <MemeCard key={meme.id} meme={meme} />
                      ))}
                    </div>
                  ) : (
                    <div className="col-span-full text-center p-10 bg-muted rounded-lg">
                      <p className="text-muted-foreground">No memes found for this filter.</p>
                      {user && (
                        <Link to="/create" className="mt-4 inline-block">
                          <Button>Create a Meme</Button>
                        </Link>
                      )}
                      {!user && (
                        <Link to="/login" className="mt-4 inline-block">
                          <Button>Sign in to Create Memes</Button>
                        </Link>
                      )}
                    </div>
                  )}
                  
                  {memes && memes.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline">Load More</Button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
