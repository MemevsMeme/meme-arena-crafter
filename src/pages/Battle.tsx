import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Battle as BattleType, Meme, Prompt } from '@/lib/types';
import { getBattleById, getMemeById } from '@/lib/database';
import { getPromptById, castVote } from '@/lib/databaseAdapter';
import { ArrowLeft, Award, Clock, ThumbsUp, Users } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import MemeCard from '@/components/meme/MemeCard';
import { formatDistanceToNow } from 'date-fns';

const Battle = () => {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [battle, setBattle] = useState<BattleType | null>(null);
  const [memeOne, setMemeOne] = useState<Meme | null>(null);
  const [memeTwo, setMemeTwo] = useState<Meme | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    const fetchBattleData = async () => {
      if (!battleId) return;
      
      try {
        setLoading(true);
        
        // Fetch battle data
        const battleData = await getBattleById(battleId);
        if (!battleData) {
          toast.error('Battle not found');
          navigate('/battles');
          return;
        }
        
        setBattle(battleData);
        
        // Fetch memes
        if (battleData.memeOneId) {
          const memeOneData = await getMemeById(battleData.memeOneId);
          setMemeOne(memeOneData);
        }
        
        if (battleData.memeTwoId) {
          const memeTwoData = await getMemeById(battleData.memeTwoId);
          setMemeTwo(memeTwoData);
        }
        
        // Fetch prompt
        if (battleData.promptId) {
          const promptData = await getPromptById(battleData.promptId);
          setPrompt(promptData);
        }
        
        // Check if user has voted
        if (user) {
          // TODO: Implement check if user has voted
          // For now, we'll just assume they haven't
          setHasVoted(false);
        }
      } catch (error) {
        console.error('Error fetching battle data:', error);
        toast.error('Failed to load battle data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBattleData();
  }, [battleId, navigate, user]);
  
  // Update time left
  useEffect(() => {
    if (!battle) return;
    
    const updateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(battle.endTime);
      
      if (now >= endTime) {
        setTimeLeft('Battle ended');
        return;
      }
      
      setTimeLeft(formatDistanceToNow(endTime, { addSuffix: true }));
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [battle]);
  
  const handleVote = async (memeId: string) => {
    if (!user || !battleId || hasVoted || voting) return;
    
    try {
      setVoting(true);
      
      const success = await castVote(user.id, battleId, memeId);
      
      if (success) {
        toast.success('Vote cast successfully!');
        setHasVoted(true);
        
        // Update the battle data
        const updatedBattle = await getBattleById(battleId);
        if (updatedBattle) {
          setBattle(updatedBattle);
        }
      } else {
        toast.error('Failed to cast vote');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('An error occurred while voting');
    } finally {
      setVoting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading battle...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!battle || !memeOne || !memeTwo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Battle not found or incomplete</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  const isActive = battle.status === 'active';
  const isCompleted = battle.status === 'completed';
  const winnerMeme = battle.winnerId ? (battle.winnerId === memeOne.id ? memeOne : memeTwo) : null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/battles')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Battles
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-heading">Meme Battle</h1>
          {prompt && (
            <p className="text-xl mt-2 text-muted-foreground">"{prompt.text}"</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                <span>{isActive ? 'Active' : 'Completed'}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{timeLeft}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ThumbsUp className="mr-2 h-5 w-5" />
                Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{battle.voteCount}</p>
              <p className="text-sm text-muted-foreground">Total votes cast</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Winner
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCompleted && winnerMeme ? (
                <div className="flex items-center">
                  <UserAvatar user={winnerMeme.creator} size="sm" />
                  <span className="ml-2">{winnerMeme.creator?.username || 'Unknown'}</span>
                </div>
              ) : (
                <p className="text-muted-foreground">Not determined yet</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <MemeCard 
              meme={memeOne} 
              showVoteButton={isActive && !hasVoted && !!user}
              onVote={() => handleVote(memeOne.id)}
              votingDisabled={voting}
              showVoteCount
              voteCount={battle.voteCount > 0 ? Math.floor(battle.voteCount / 2) : 0}
            />
          </div>
          
          <div>
            <MemeCard 
              meme={memeTwo} 
              showVoteButton={isActive && !hasVoted && !!user}
              onVote={() => handleVote(memeTwo.id)}
              votingDisabled={voting}
              showVoteCount
              voteCount={battle.voteCount > 0 ? Math.ceil(battle.voteCount / 2) : 0}
            />
          </div>
        </div>
        
        {!user && isActive && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-center">
            <p>You need to be logged in to vote in this battle.</p>
            <Button 
              className="mt-2"
              onClick={() => navigate('/login')}
            >
              Log In to Vote
            </Button>
          </div>
        )}
        
        {hasVoted && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-center">
            <p>Thanks for voting! Check back later to see the results.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Battle;
