
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BattleCard from '@/components/battle/BattleCard';
import BattleFilter from '@/components/battle/BattleFilter';
import MemeCard from '@/components/meme/MemeCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  getActiveBattles, 
  getPrompts, 
  getMemesByBattleId,
  getBattleById
} from '@/lib/database';
import { Battle as BattleType, Prompt, Meme } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { BattleFilterType } from '@/components/battle/BattleFilter';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import UserAvatar from '@/components/ui/UserAvatar';

const Battles = () => {
  const [filter, setFilter] = useState<BattleFilterType>('all');
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'battles' | 'leaderboard'>('battles');
  const itemsPerPage = 6;
  const { user } = useAuth();
  
  // Query battles based on filter
  const { data: battles, isLoading: battlesLoading } = useQuery({
    queryKey: ['battles', filter, currentPage],
    queryFn: async () => {
      try {
        return await getActiveBattles(itemsPerPage, currentPage * itemsPerPage, filter);
      } catch (error) {
        console.error('Error fetching battles:', error);
        return [];
      }
    }
  });
  
  // Query prompts for ongoing battles that don't have enough meme submissions yet
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
  
  // Query memes for selected battle
  const { data: battleMemes, isLoading: memesLoading } = useQuery({
    queryKey: ['battle_memes', selectedBattleId],
    queryFn: async () => {
      if (!selectedBattleId) return [];
      try {
        return await getMemesByBattleId(selectedBattleId);
      } catch (error) {
        console.error('Error fetching battle memes:', error);
        return [];
      }
    },
    enabled: !!selectedBattleId
  });
  
  // Query selected battle details
  const { data: selectedBattle } = useQuery({
    queryKey: ['battle_details', selectedBattleId],
    queryFn: async () => {
      if (!selectedBattleId) return null;
      try {
        return await getBattleById(selectedBattleId);
      } catch (error) {
        console.error('Error fetching battle details:', error);
        return null;
      }
    },
    enabled: !!selectedBattleId
  });
  
  const handleFilterChange = (newFilter: BattleFilterType) => {
    setFilter(newFilter);
    setCurrentPage(0); // Reset to first page when filter changes
  };
  
  const handleBattleSelect = (battleId: string) => {
    setSelectedBattleId(battleId);
    setActiveTab('leaderboard');
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (battles && battles.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'battles' | 'leaderboard');
    if (tab === 'battles') {
      setSelectedBattleId(null);
    }
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
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="battles">Active Battles</TabsTrigger>
            <TabsTrigger value="leaderboard" disabled={!selectedBattleId}>
              {selectedBattle ? 'Battle Leaderboard' : 'Select a Battle'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="battles">
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
                      <div 
                        key={battle.id} 
                        className="cursor-pointer"
                        onClick={() => handleBattleSelect(battle.id)}
                      >
                        <BattleCard key={battle.id} battle={battle as BattleType} />
                      </div>
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
                
                {battles && battles.length > 0 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={handlePreviousPage}
                          className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <div className="px-4">Page {currentPage + 1}</div>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext 
                          onClick={handleNextPage}
                          className={(battles.length < itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
            
            {/* Active Prompts - Battles waiting for submissions */}
            {!promptsLoading && prompts && prompts.length > 0 && (
              <>
                <h2 className="text-2xl font-heading mt-10 mb-4">Open Battles - Join Now</h2>
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
                        {prompt.description || "Join this battle and create an awesome meme!"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Ends in {Math.round((prompt.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                        {user ? (
                          <Link to={`/create?promptId=${prompt.id}`}>
                            <Button size="sm">Join Battle</Button>
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
                <h2 className="text-2xl font-heading mb-4">Open Battles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-muted animate-pulse rounded-lg h-40"></div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="leaderboard">
            {selectedBattleId && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab('battles');
                      setSelectedBattleId(null);
                    }}
                    className="mb-4"
                  >
                    ← Back to Battles
                  </Button>
                  
                  {selectedBattle?.promptId && user && (
                    <Link to={`/create?promptId=${selectedBattle.promptId}`}>
                      <Button>Join This Battle</Button>
                    </Link>
                  )}
                </div>
                
                {selectedBattle && (
                  <div className="bg-background border rounded-xl p-4 mb-6">
                    <h2 className="text-2xl font-heading mb-2">
                      Battle Leaderboard
                    </h2>
                    <p className="text-muted-foreground mb-2">
                      {selectedBattle.prompt?.text || "Meme Battle Submissions"}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedBattle.status === 'active' ? 'bg-green-500' : 'bg-muted'}`}></div>
                      <span className="text-sm">
                        {selectedBattle.status === 'active' 
                          ? `Active until ${new Date(selectedBattle.endTime).toLocaleDateString()}`
                          : 'Battle ended'
                        }
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-sm font-medium">Total Votes: {selectedBattle.voteCount}</span>
                    </div>
                  </div>
                )}
                
                {/* Featured top memes */}
                {selectedBattle && selectedBattle.memeOne && selectedBattle.memeTwo && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Featured Battle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <UserAvatar user={{ id: selectedBattle.memeOne.creatorId }} showUsername />
                          <span className="font-medium">{selectedBattle.memeOne.votes} votes</span>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <MemeCard meme={selectedBattle.memeOne} showActions={false} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <UserAvatar user={{ id: selectedBattle.memeTwo.creatorId }} showUsername />
                          <span className="font-medium">{selectedBattle.memeTwo.votes} votes</span>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <MemeCard meme={selectedBattle.memeTwo} showActions={false} />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-4">
                      <Link to={`/battle/${selectedBattle.id}`}>
                        <Button variant="outline">View Battle Details</Button>
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* All submissions */}
                <div>
                  <h3 className="text-lg font-medium mb-4">All Submissions</h3>
                  
                  {memesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-muted animate-pulse rounded-lg h-64"></div>
                      ))}
                    </div>
                  ) : battleMemes && battleMemes.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Meme</TableHead>
                          <TableHead>Creator</TableHead>
                          <TableHead className="text-right">Votes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {battleMemes.map((meme, index) => (
                          <TableRow key={meme.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="w-20 h-20 relative overflow-hidden rounded-md">
                                <img 
                                  src={meme.imageUrl} 
                                  alt={meme.caption} 
                                  className="object-cover w-full h-full"
                                  onClick={() => {
                                    window.open(meme.imageUrl, '_blank');
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <UserAvatar user={{ id: meme.creatorId }} showUsername />
                            </TableCell>
                            <TableCell className="text-right font-medium">{meme.votes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <p className="text-muted-foreground">No submissions found for this battle yet.</p>
                      {user && selectedBattle?.promptId && (
                        <Link to={`/create?promptId=${selectedBattle.promptId}`} className="mt-4 inline-block">
                          <Button>Be the First to Submit</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
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
