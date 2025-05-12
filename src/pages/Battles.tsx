
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BattleCard from '@/components/battle/BattleCard';
import BattleFilter from '@/components/battle/BattleFilter';
import { Button } from '@/components/ui/button';
import { getActiveBattles, getPrompts } from '@/lib/database';
import { Battle as BattleType, Prompt } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

const Battles = () => {
  const [filter, setFilter] = useState<'all' | 'official' | 'community'>('all');
  const { user } = useAuth();
  
  // Query battles based on filter
  const { data: battles, isLoading: battlesLoading } = useQuery({
    queryKey: ['battles', filter],
    queryFn: async () => {
      try {
        return await getActiveBattles(20, 0, filter);
      } catch (error) {
        console.error('Error fetching battles:', error);
        return [];
      }
    }
  });
  
  // Query prompts for ongoing challenges that don't have battles yet
  const { data: prompts, isLoading: promptsLoading } = useQuery({
    queryKey: ['active_prompts', filter],
    queryFn: async () => {
      try {
        if (filter === 'community') {
          return await getPrompts(10, 0, true);
        } else if (filter === 'official') {
          return await getPrompts(10, 0, false);
        } else {
          const communityPrompts = await getPrompts(5, 0, true);
          const officialPrompts = await getPrompts(5, 0, false);
          return [...officialPrompts, ...communityPrompts];
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
        return [];
      }
    }
  });
  
  const handleFilterChange = (newFilter: 'all' | 'official' | 'community') => {
    setFilter(newFilter);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading">Meme Battles</h1>
          
          {user && (
            <Link to="/create-battle">
              <Button>Create a Battle</Button>
            </Link>
          )}
        </div>
        
        <div className="mb-6">
          <BattleFilter activeFilter={filter} onFilterChange={handleFilterChange} />
        </div>
        
        {battlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <>
            {battles && battles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {battles.map(battle => (
                  <BattleCard key={battle.id} battle={battle as BattleType} />
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-4">No battles found for this filter.</p>
                {user && (
                  <Link to="/create-battle">
                    <Button>Create a Battle</Button>
                  </Link>
                )}
                {!user && (
                  <Link to="/login">
                    <Button>Sign in to Create Battles</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Active Prompts without battles yet */}
        {!promptsLoading && prompts && prompts.length > 0 && (
          <>
            <h2 className="text-2xl font-heading mt-10 mb-4">Ongoing Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prompts.map(prompt => (
                <div key={prompt.id} className="bg-background border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg mb-2">{prompt.text}</h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {prompt.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {prompt.description || "Join this challenge and create an awesome meme!"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Ends in {Math.round((prompt.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                    {user ? (
                      <Link to={`/create?promptId=${prompt.id}`}>
                        <Button size="sm">Join Challenge</Button>
                      </Link>
                    ) : (
                      <Link to="/login">
                        <Button size="sm">Sign in to Join</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {promptsLoading && (
          <div className="mt-10">
            <h2 className="text-2xl font-heading mb-4">Ongoing Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-40"></div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Battles;
