
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeCard from '@/components/meme/MemeCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import UserAvatar from '@/components/ui/UserAvatar';
import { ArrowLeft, Share, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Battle as BattleType, Meme as MemeType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { getBattleById, getPromptById, castVote } from '@/lib/database';

const Battle = () => {
  const { id } = useParams<{ id: string }>();
  const [voteSubmitted, setVoteSubmitted] = useState<'one' | 'two' | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Query battle data
  const { data: battle, isLoading: battleLoading } = useQuery({
    queryKey: ['battle', id],
    queryFn: async () => {
      if (!id) return null;
      return await getBattleById(id);
    },
    enabled: !!id
  });

  // Get prompt data if available
  const { data: prompt } = useQuery({
    queryKey: ['prompt', battle?.promptId],
    queryFn: async () => {
      if (!battle?.promptId) return null;
      return await getPromptById(battle.promptId);
    },
    enabled: !!battle?.promptId
  });
  
  // Check if user has already voted
  const { data: userVote } = useQuery({
    queryKey: ['user_vote', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('votes')
        .select('meme_id')
        .eq('battle_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking vote:', error);
        return null;
      }
      
      if (data) {
        if (battle?.memeOneId === data.meme_id) {
          return 'one';
        } else if (battle?.memeTwoId === data.meme_id) {
          return 'two';
        }
      }
      
      return null;
    },
    enabled: !!user && !!id && !!battle
  });
  
  // Set vote state based on query result
  useEffect(() => {
    if (userVote) {
      setVoteSubmitted(userVote);
    }
  }, [userVote]);
  
  // Handle voting
  const voteMutation = useMutation({
    mutationFn: async ({ battleId, memeId, userId }: { battleId: string, memeId: string, userId: string }) => {
      return await castVote(battleId, memeId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battle', id] });
      queryClient.invalidateQueries({ queryKey: ['user_vote', id, user?.id] });
    }
  });
  
  const handleVote = (meme: 'one' | 'two') => {
    if (voteSubmitted || !user || !battle) return;
    
    const memeId = meme === 'one' ? battle.memeOneId : battle.memeTwoId;
    setVoteSubmitted(meme);
    
    voteMutation.mutate({ 
      battleId: battle.id, 
      memeId, 
      userId: user.id 
    });
    
    // Show success message
    toast.success('Vote submitted!', {
      description: 'Thanks for participating in this battle.'
    });
  };
  
  const handleShare = () => {
    // Copy battle link to clipboard
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Battle link copied to clipboard!', {
        description: 'Share with friends to get more votes!'
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    });
  };

  if (battleLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="text-center p-10">
            <p>Battle not found or has been removed.</p>
            <Link to="/battles" className="mt-4 inline-block">
              <Button>Back to Battles</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Extract memes for convenience
  const { memeOne, memeTwo } = battle;

  if (!memeOne || !memeTwo) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="text-center p-10">
            <p>This battle is missing one or both memes.</p>
            <Link to="/battles" className="mt-4 inline-block">
              <Button>Back to Battles</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate votes
  const totalVotes = battle.voteCount || 0;
  const percentOne = totalVotes > 0 && battle.voteCount ? Math.round((memeOne.votes / totalVotes) * 100) : 50;
  const percentTwo = 100 - percentOne;
  
  const timeRemaining = new Date(battle.endTime).getTime() - Date.now();
  const isActive = battle.status === 'active' && timeRemaining > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <Link to="/battles" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Battles</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1.5">
              <Share className="h-4 w-4" />
              Share
            </Button>
            
            {user && battle.promptId && (
              <Link to={`/create?promptId=${battle.promptId}`}>
                <Button variant="default" size="sm" className="flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4" />
                  Create Meme
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-background border rounded-xl p-4 mb-6">
          <h1 className="text-2xl font-heading mb-2">Meme Battle</h1>
          <p className="text-muted-foreground mb-4">{prompt?.text || "Battle challenge"}</p>
          
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-muted'}`}></div>
              <span className={`text-sm ${isActive ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                {isActive ? 'Live Battle' : 'Battle Ended'}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{totalVotes}</span> votes
            </div>
          </div>
          
          <Progress value={percentOne} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="mb-3 flex justify-between">
              <UserAvatar user={{ id: memeOne.creatorId }} showUsername />
              <span className="text-xl font-bold">{percentOne}%</span>
            </div>
            
            <div className={`battle-card ${voteSubmitted === 'one' ? 'border-2 border-brand-orange' : 'border'} rounded-lg overflow-hidden`}>
              <MemeCard meme={memeOne as MemeType} showActions={false} />
              
              <div className="p-4 bg-background">
                {!isActive ? (
                  <div className="text-center text-muted-foreground">
                    {battle.status === 'completed' ? (
                      battle.winnerId === memeOne.id ? 
                        <span className="text-green-500 font-medium">Winner!</span> : 
                        <span>Better luck next time</span>
                    ) : (
                      <span>Voting closed</span>
                    )}
                  </div>
                ) : !voteSubmitted ? (
                  <Button 
                    className="w-full bg-brand-purple hover:bg-brand-purple/90" 
                    onClick={() => handleVote('one')}
                    disabled={!user}
                  >
                    {user ? 'Vote for this meme' : 'Sign in to vote'}
                  </Button>
                ) : (
                  <div className="text-center">
                    {voteSubmitted === 'one' ? (
                      <span className="text-brand-orange font-medium">You voted for this meme</span>
                    ) : (
                      <span className="text-muted-foreground">You voted for the other meme</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-3 flex justify-between">
              <UserAvatar user={{ id: memeTwo.creatorId }} showUsername />
              <span className="text-xl font-bold">{percentTwo}%</span>
            </div>
            
            <div className={`battle-card ${voteSubmitted === 'two' ? 'border-2 border-brand-orange' : 'border'} rounded-lg overflow-hidden`}>
              <MemeCard meme={memeTwo as MemeType} showActions={false} />
              
              <div className="p-4 bg-background">
                {!isActive ? (
                  <div className="text-center text-muted-foreground">
                    {battle.status === 'completed' ? (
                      battle.winnerId === memeTwo.id ? 
                        <span className="text-green-500 font-medium">Winner!</span> : 
                        <span>Better luck next time</span>
                    ) : (
                      <span>Voting closed</span>
                    )}
                  </div>
                ) : !voteSubmitted ? (
                  <Button 
                    className="w-full bg-brand-purple hover:bg-brand-purple/90" 
                    onClick={() => handleVote('two')}
                    disabled={!user}
                  >
                    {user ? 'Vote for this meme' : 'Sign in to vote'}
                  </Button>
                ) : (
                  <div className="text-center">
                    {voteSubmitted === 'two' ? (
                      <span className="text-brand-orange font-medium">You voted for this meme</span>
                    ) : (
                      <span className="text-muted-foreground">You voted for the other meme</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {user && battle.promptId && (
          <div className="bg-muted p-6 rounded-lg text-center">
            <h2 className="text-xl font-heading mb-4">Want to join this battle?</h2>
            <p className="mb-4">Create your own meme for this prompt and it could be featured in future battles!</p>
            <Link to={`/create?promptId=${battle.promptId}`}>
              <Button>Create a Meme</Button>
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default Battle;
