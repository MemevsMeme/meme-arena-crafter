import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { User, Meme, Battle } from '@/lib/types';
import { getTrendingMemes } from '@/lib/database/memes';
import { getActiveBattles } from '@/lib/database/battles';
import { Award, Medal, Search, Trophy, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserRanking extends User {
  rank: number;
  totalWins: number;
}

interface MemeRanking extends Meme {
  rank: number;
}

interface BattleRanking extends Battle {
  rank: number;
  totalVotes: number;
}

const Leaderboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const initialTab = searchParams.get('tab') || 'users';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Fetch top users ranked by wins
  const { data: topUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['top-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('wins', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return data.map((user, index) => ({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
        memeStreak: user.meme_streak || 0,
        wins: user.wins || 0,
        losses: user.losses || 0,
        level: user.level || 1,
        xp: user.xp || 0,
        createdAt: new Date(user.created_at),
        rank: index + 1,
        totalWins: user.wins || 0
      })) as UserRanking[];
    }
  });

  // Fetch trending memes
  const { data: topMemes = [], isLoading: loadingMemes } = useQuery({
    queryKey: ['top-memes'],
    queryFn: async () => {
      const memes = await getTrendingMemes(10);
      return memes.map((meme, index) => ({
        ...meme,
        rank: index + 1
      })) as MemeRanking[];
    }
  });

  // Fetch top battles by vote count
  const { data: topBattles = [], isLoading: loadingBattles } = useQuery({
    queryKey: ['top-battles'],
    queryFn: async () => {
      const battles = await getActiveBattles(10, 0, 'all');
      return battles
        .sort((a, b) => b.voteCount - a.voteCount)
        .map((battle, index) => ({
          ...battle,
          rank: index + 1,
          totalVotes: battle.voteCount
        })) as BattleRanking[];
    }
  });

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Filter users by search term
  const filteredUsers = searchTerm
    ? topUsers.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    : topUsers;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">Meme Leaderboard</h1>
          <p className="text-center text-muted-foreground mb-6">See the top creators, memes, and battles</p>
          
          <div className="flex items-center justify-between mb-6">
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="users">Top Users</TabsTrigger>
                <TabsTrigger value="memes">Top Memes</TabsTrigger>
                <TabsTrigger value="battles">Top Battles</TabsTrigger>
              </TabsList>
              
              <div className="relative mb-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-brand-orange" />
                      Top Meme Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingUsers ? (
                      <div className="space-y-4">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                              <div className="h-3 bg-muted rounded w-1/6"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      <div className="space-y-2">
                        {filteredUsers.map((user) => (
                          <Link 
                            key={user.id} 
                            to={`/profile/${user.id}`}
                            className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-center w-10 mr-3">
                              {user.rank <= 3 ? (
                                <div className={`rounded-full p-2 ${
                                  user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  user.rank === 2 ? 'bg-slate-100 text-slate-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  <Trophy className="h-4 w-4" />
                                </div>
                              ) : (
                                <span className="text-muted-foreground font-medium">{user.rank}</span>
                              )}
                            </div>
                            
                            <UserAvatar user={user} showUsername showLevel linkToProfile={false} />
                            
                            <div className="ml-auto flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-medium">{user.wins} wins</div>
                                <div className="text-xs text-muted-foreground">Level {user.level}</div>
                              </div>
                              
                              <Award className="h-5 w-5 text-brand-orange" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No users match your search</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="memes">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-brand-purple" />
                      Top Memes by Votes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingMemes ? (
                      <div className="space-y-4">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center p-3 border rounded-lg">
                            <div className="w-16 h-16 bg-muted rounded mr-3"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                              <div className="h-3 bg-muted rounded w-1/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : topMemes.length > 0 ? (
                      <div className="space-y-3">
                        {topMemes.map((meme) => (
                          <Link 
                            key={meme.id} 
                            to={`/meme/${meme.id}`}
                            className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-center w-10 mr-3">
                              {meme.rank <= 3 ? (
                                <div className={`rounded-full p-2 ${
                                  meme.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  meme.rank === 2 ? 'bg-slate-100 text-slate-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  <Medal className="h-4 w-4" />
                                </div>
                              ) : (
                                <span className="text-muted-foreground font-medium">{meme.rank}</span>
                              )}
                            </div>
                            
                            <div className="h-16 w-16 bg-muted rounded overflow-hidden mr-4 flex-shrink-0">
                              {meme.imageUrl && (
                                <img 
                                  src={meme.imageUrl} 
                                  alt={meme.caption} 
                                  className="h-full w-full object-cover" 
                                />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{meme.caption}</div>
                              <div className="text-sm text-muted-foreground">{meme.creator?.username || 'Unknown creator'}</div>
                            </div>
                            
                            <div className="ml-auto text-right">
                              <div className="font-medium">{meme.votes} votes</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No memes found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="battles">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-brand-purple" />
                      Top Battles by Participation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingBattles ? (
                      <div className="space-y-4">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center p-3 border rounded-lg">
                            <div className="h-4 bg-muted rounded w-10 mr-3"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                              <div className="h-3 bg-muted rounded w-1/5"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : topBattles.length > 0 ? (
                      <div className="space-y-3">
                        {topBattles.map((battle) => (
                          <Link 
                            key={battle.id} 
                            to={`/battle/${battle.id}`}
                            className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-center w-10 mr-3">
                              {battle.rank <= 3 ? (
                                <div className={`rounded-full p-2 ${
                                  battle.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  battle.rank === 2 ? 'bg-slate-100 text-slate-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  <Trophy className="h-4 w-4" />
                                </div>
                              ) : (
                                <span className="text-muted-foreground font-medium">{battle.rank}</span>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="font-medium">Battle #{battle.id.substring(0, 8)}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {/* Fix: Convert prompt to string if it's an object */}
                                {typeof battle.prompt === 'string' 
                                  ? battle.prompt 
                                  : battle.prompt?.text || "Random Battle"}
                              </div>
                            </div>
                            
                            <div className="ml-auto flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-medium">{battle.totalVotes} votes</div>
                                <div className="text-xs text-muted-foreground">
                                  {battle.status === 'active' ? 'Active' : 'Completed'}
                                </div>
                              </div>
                              
                              <Button variant="ghost" size="icon">
                                {battle.status === 'active' ? (
                                  <Users className="h-4 w-4" />
                                ) : (
                                  <Trophy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No battles found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Leaderboard;
