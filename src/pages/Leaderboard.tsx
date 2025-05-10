
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UserAvatar from '@/components/ui/UserAvatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_USERS } from '@/lib/constants';
import { Award, Crown, Star, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

const Leaderboard = () => {
  // Query to fetch real user data (temporarily using mock data)
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['leaderboardUsers'],
    queryFn: async () => {
      try {
        // For now, return mock data
        return MOCK_USERS;
        
        // Real implementation would be:
        /*
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('xp', { ascending: false })
          .limit(20);
          
        if (error) {
          console.error('Error fetching users:', error);
          return [];
        }
        
        return data;
        */
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
      }
    },
  });
  
  // Create a copy of mock users and sort by various metrics
  const users = usersData || [];
  const topCreators = [...users].sort((a, b) => b.xp - a.xp);
  const topWinners = [...users].sort((a, b) => (b.wins / (b.wins + b.losses)) - (a.wins / (a.wins + a.losses)));
  const topStreaks = [...users].sort((a, b) => b.memeStreak - a.memeStreak);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">See who's creating the dankest memes this week</p>
          </div>
          
          <Tabs defaultValue="xp">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="xp" className="flex-1">
                <Star className="h-4 w-4 mr-2" />
                Top Creators
              </TabsTrigger>
              <TabsTrigger value="battles" className="flex-1">
                <Crown className="h-4 w-4 mr-2" />
                Battle Champs
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Best Streaks
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="xp" className="space-y-2">
              <LeaderboardSection title="Weekly XP Leaders" users={topCreators} metric="xp" />
            </TabsContent>
            
            <TabsContent value="battles" className="space-y-2">
              <LeaderboardSection title="Battle Champions" users={topWinners} metric="wins" />
            </TabsContent>
            
            <TabsContent value="streak" className="space-y-2">
              <LeaderboardSection title="Streak Masters" users={topStreaks} metric="streak" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

interface LeaderboardSectionProps {
  title: string;
  users: Array<any>; // Using 'any' temporarily until we transition away from mock data
  metric: 'xp' | 'wins' | 'streak';
}

const LeaderboardSection = ({ title, users, metric }: LeaderboardSectionProps) => {
  return (
    <div className="bg-background border rounded-xl overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-heading text-lg">{title}</h2>
        <span className="text-xs text-muted-foreground">Updated daily</span>
      </div>
      
      <div className="divide-y">
        {users.map((user, index) => (
          <div key={user.id} className={`p-4 flex items-center ${index < 3 ? 'bg-muted/30' : ''}`}>
            <div className="w-8 mr-3 text-center font-bold">
              {index === 0 && <Crown className="h-5 w-5 text-yellow-500 mx-auto" />}
              {index === 1 && <Award className="h-5 w-5 text-gray-400 mx-auto" />}
              {index === 2 && <Award className="h-5 w-5 text-orange-400 mx-auto" />}
              {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
            </div>
            
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} showUsername showLevel />
              </div>
              
              <div className="text-right">
                {metric === 'xp' && (
                  <>
                    <div className="font-bold">{user.xp} XP</div>
                    <div className="text-xs text-muted-foreground">Level {user.level}</div>
                  </>
                )}
                {metric === 'wins' && (
                  <>
                    <div className="font-bold">{user.wins} Wins</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((user.wins / (user.wins + user.losses)) * 100)}% win rate
                    </div>
                  </>
                )}
                {metric === 'streak' && (
                  <>
                    <div className="font-bold">{user.memeStreak} Days</div>
                    <div className="text-xs text-muted-foreground">Current streak</div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No data available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
