
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Battle, Meme } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveBattles, getBattleById } from '@/lib/database';
import { getMemeById } from '@/lib/database/memes';
import { Clock, Trophy, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { runBattleMaintenance } from '@/lib/services/battleService';

type BattleFilterType = 'active' | 'completed' | 'community' | 'all';

const Battles = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [filter, setFilter] = useState<BattleFilterType>('active');
  const [loading, setLoading] = useState(true);
  const [memeCache, setMemeCache] = useState<Record<string, Meme>>({});
  const { session } = useAuth();

  useEffect(() => {
    const fetchBattles = async () => {
      setLoading(true);
      try {
        // Run maintenance to complete any ended battles
        await runBattleMaintenance();
        
        // Fetch battles based on the selected filter
        const status = filter === 'community' ? 'all' : filter === 'all' ? 'all' : filter;
        const fetchedBattles = await getActiveBattles(10, 0, status);
        
        if (filter === 'community') {
          setBattles(fetchedBattles.filter(battle => battle.is_community));
        } else {
          setBattles(fetchedBattles);
        }
        
        // Fetch meme details for all battles
        for (const battle of fetchedBattles) {
          if (battle.memeOneId && !memeCache[battle.memeOneId]) {
            const meme = await getMemeById(battle.memeOneId);
            if (meme) {
              setMemeCache(prev => ({
                ...prev,
                [battle.memeOneId]: meme
              }));
            }
          }
          
          if (battle.memeTwoId && !memeCache[battle.memeTwoId]) {
            const meme = await getMemeById(battle.memeTwoId);
            if (meme) {
              setMemeCache(prev => ({
                ...prev,
                [battle.memeTwoId]: meme
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching battles:', error);
        toast.error('Failed to fetch battles');
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
    
    // Check for ended battles and refresh battles list every minute
    const intervalId = setInterval(fetchBattles, 60000);
    return () => clearInterval(intervalId);
  }, [filter]);

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    if (now >= endTime) {
      return 'Battle ended';
    }
    return formatDistanceToNow(endTime, { addSuffix: true });
  };
  
  // Helper function to get prompt text
  const getPromptText = (battle: Battle): string => {
    if (typeof battle.prompt === 'string') {
      return battle.prompt;
    } else if (battle.prompt?.text) {
      return battle.prompt.text;
    }
    return "Random Meme Battle";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Meme Battles</h1>
            <p className="text-muted-foreground">Vote on your favorite memes and see who wins!</p>
          </div>

          <div className="flex items-center gap-2">
            <Select onValueChange={(value: BattleFilterType) => setFilter(value)} value={filter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="active">Active Battles</SelectItem>
                  <SelectItem value="completed">Completed Battles</SelectItem>
                  <SelectItem value="community">Community Battles</SelectItem>
                  <SelectItem value="all">All Battles</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="grid" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="bg-background shadow-md animate-pulse">
                    <CardHeader className="h-24"></CardHeader>
                    <CardContent className="h-32"></CardContent>
                  </Card>
                ))}
              </div>
            ) : battles.length === 0 ? (
              <Card className="bg-background shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-center text-muted-foreground">No battles found matching your filter</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setFilter('active')}
                  >
                    View Active Battles
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {battles.map(battle => (
                  <Link key={battle.id} to={`/battle/${battle.id}`} className="block group">
                    <Card className="bg-background shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full group-hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {battle.status === 'completed' ? (
                              <>
                                <Trophy className="w-5 h-5 text-brand-orange" />
                                <span>Battle {battle.id.substring(0, 5)}</span>
                              </>
                            ) : (
                              <>
                                <Users className="w-5 h-5 text-brand-purple" />
                                <span>Battle {battle.id.substring(0, 5)}</span>
                              </>
                            )}
                          </CardTitle>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${battle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {battle.status === 'active' ? 'Active' : 'Completed'}
                          </div>
                        </div>
                        <CardDescription>
                          {getPromptText(battle)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="w-4 h-4" /> 
                          {battle.status === 'active' ? (
                            <span>Ends {formatTimeRemaining(battle.endTime)}</span>
                          ) : (
                            <span>Completed on {battle.endTime.toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between mt-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Votes:</span> 
                            <span className="font-medium ml-1">{battle.voteCount || 0}</span>
                          </div>
                          {battle.status === 'completed' && battle.winnerId && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Winner:</span>
                              <span className="font-medium ml-1">
                                {battle.winnerId === battle.memeOneId ? 'Meme #1' : 'Meme #2'}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 pt-3 pb-3">
                        <Button variant="secondary" className="w-full">View Battle</Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Card key={i} className="bg-background shadow-md animate-pulse">
                    <CardHeader className="py-4"></CardHeader>
                  </Card>
                ))}
              </div>
            ) : battles.length === 0 ? (
              <Card className="bg-background shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-center text-muted-foreground">No battles found matching your filter</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setFilter('active')}
                  >
                    View Active Battles
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {battles.map(battle => (
                  <Link key={battle.id} to={`/battle/${battle.id}`} className="block">
                    <Card className="bg-background shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group-hover:border-primary/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${battle.status === 'active' ? 'bg-green-100' : 'bg-blue-100'}`}>
                            {battle.status === 'active' ? (
                              <Users className="w-5 h-5 text-green-800" />
                            ) : (
                              <Trophy className="w-5 h-5 text-blue-800" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">Battle #{battle.id.substring(0, 8)}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {getPromptText(battle)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="hidden md:block text-right">
                            <div className="text-sm font-medium">
                              {battle.status === 'active' ? (
                                `Ends ${formatTimeRemaining(battle.endTime)}`
                              ) : (
                                `Completed`
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {battle.voteCount || 0} votes
                            </div>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${battle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {battle.status === 'active' ? 'Active' : 'Completed'}
                          </div>
                          
                          <Button size="sm" variant="secondary">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Battles;
