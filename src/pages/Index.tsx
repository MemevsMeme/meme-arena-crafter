
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PromptOfTheDay from '@/components/meme/PromptOfTheDay';
import MemeCard from '@/components/meme/MemeCard';
import BattleCard from '@/components/battle/BattleCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_MEMES, MOCK_BATTLES, MOCK_PROMPTS } from '@/lib/constants';
import { Battle } from '@/lib/types';

const Index = () => {
  const [activeFeedTab, setActiveFeedTab] = useState<string>('trending');
  
  const todaysMemes = MOCK_MEMES.slice(0, 3);
  const activeBattles = MOCK_BATTLES as Battle[];
  const recentBattles = activeBattles.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Prompts and battles */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <section>
              <h2 className="text-2xl font-heading mb-3">Today's Challenge</h2>
              <PromptOfTheDay prompt={MOCK_PROMPTS[0]} />
              
              <div className="mt-4">
                <h3 className="font-heading text-lg mb-2">Previous Prompts</h3>
                <div className="space-y-2">
                  {MOCK_PROMPTS.slice(1).map(prompt => (
                    <div key={prompt.id} className="p-3 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer">
                      <p className="font-medium">{prompt.text}</p>
                      <div className="flex gap-1 mt-1">
                        {prompt.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 rounded-full bg-background">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-heading">Live Battles</h2>
                <Button variant="link" className="text-sm" asChild>
                  <a href="/battles">View all</a>
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentBattles.map(battle => (
                  <BattleCard key={battle.id} battle={battle} compact />
                ))}
                
                {recentBattles.length === 0 && (
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No active battles. Create a meme to start one!</p>
                  </div>
                )}
              </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todaysMemes.map(meme => (
                  <MemeCard key={meme.id} meme={meme} />
                ))}
                
                {todaysMemes.length === 0 && (
                  <div className="col-span-full text-center p-10 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No memes found. Be the first to create one!</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline">Load More</Button>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
