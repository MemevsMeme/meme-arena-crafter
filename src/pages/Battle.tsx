
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeCard from '@/components/meme/MemeCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MOCK_BATTLES, MOCK_MEMES, MOCK_USERS, MOCK_PROMPTS } from '@/lib/constants';
import UserAvatar from '@/components/ui/UserAvatar';
import { ArrowLeft, Share, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Battle = () => {
  const { id } = useParams<{ id: string }>();
  const [voteSubmitted, setVoteSubmitted] = useState<'one' | 'two' | null>(null);
  
  // For MVP, we'll use mock data
  const battle = MOCK_BATTLES.find(b => b.id === id) || MOCK_BATTLES[0];
  const memeOne = MOCK_MEMES.find(m => m.id === battle.memeOneId) || MOCK_MEMES[0];
  const memeTwo = MOCK_MEMES.find(m => m.id === battle.memeTwoId) || MOCK_MEMES[1];
  const prompt = battle.prompt || MOCK_PROMPTS.find(p => p.id === battle.promptId);
  
  const creatorOne = MOCK_USERS.find(u => u.id === memeOne.creatorId);
  const creatorTwo = MOCK_USERS.find(u => u.id === memeTwo.creatorId);
  
  // Mock vote count
  const [votes, setVotes] = useState({
    one: Math.floor(battle.voteCount * 0.6),
    two: Math.floor(battle.voteCount * 0.4),
  });
  
  const totalVotes = votes.one + votes.two;
  const percentOne = totalVotes > 0 ? Math.round((votes.one / totalVotes) * 100) : 50;
  const percentTwo = totalVotes > 0 ? 100 - percentOne : 50;
  
  const timeRemaining = new Date(battle.endTime).getTime() - Date.now();
  const isActive = battle.status === 'active' && timeRemaining > 0;
  
  const handleVote = (meme: 'one' | 'two') => {
    if (voteSubmitted) return;
    
    setVoteSubmitted(meme);
    
    // Update vote counts
    if (meme === 'one') {
      setVotes(prev => ({ ...prev, one: prev.one + 1 }));
    } else {
      setVotes(prev => ({ ...prev, two: prev.two + 1 }));
    }
    
    // Show success message
    toast.success('Vote submitted!', {
      description: 'Thanks for participating in this battle.'
    });
  };
  
  const handleShare = () => {
    // Mock share functionality
    toast.success('Battle link copied to clipboard!', {
      description: 'Share with friends to get more votes!'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Feed</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1.5">
              <Share className="h-4 w-4" />
              Share
            </Button>
            
            <Button variant="default" size="sm" className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Create Remix
            </Button>
          </div>
        </div>
        
        <div className="bg-background border rounded-xl p-4 mb-6">
          <h1 className="text-2xl font-heading mb-2">Meme Battle</h1>
          <p className="text-muted-foreground mb-4">{prompt?.text || "Today's prompt challenge"}</p>
          
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
              {creatorOne && <UserAvatar user={creatorOne} showUsername />}
              <span className="text-xl font-bold">{percentOne}%</span>
            </div>
            
            <div className={`battle-card ${voteSubmitted === 'one' ? 'border-brand-orange' : ''}`}>
              <MemeCard meme={memeOne} showActions={false} />
              
              <div className="p-4 bg-background">
                {!voteSubmitted ? (
                  <Button 
                    className="w-full bg-brand-purple hover:bg-brand-purple/90" 
                    onClick={() => handleVote('one')}
                  >
                    Vote for this meme
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
              {creatorTwo && <UserAvatar user={creatorTwo} showUsername />}
              <span className="text-xl font-bold">{percentTwo}%</span>
            </div>
            
            <div className={`battle-card ${voteSubmitted === 'two' ? 'border-brand-orange' : ''}`}>
              <MemeCard meme={memeTwo} showActions={false} />
              
              <div className="p-4 bg-background">
                {!voteSubmitted ? (
                  <Button 
                    className="w-full bg-brand-purple hover:bg-brand-purple/90" 
                    onClick={() => handleVote('two')}
                  >
                    Vote for this meme
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
        
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-heading mb-4">Related Battles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_BATTLES.slice(0, 2).map(battle => {
              const battlePrompt = MOCK_PROMPTS.find(p => p.id === battle.promptId);
              return (
                <div key={battle.id} className="bg-background rounded-lg overflow-hidden border">
                  <div className="p-3 border-b">
                    <p className="font-medium">{battlePrompt?.text || "Meme Battle"}</p>
                  </div>
                  <div className="flex">
                    <div className="flex-1">
                      <img 
                        src={MOCK_MEMES[0].imageUrl} 
                        alt="Meme" 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                    <div className="p-2 bg-muted flex items-center">
                      <span className="font-bold">VS</span>
                    </div>
                    <div className="flex-1">
                      <img 
                        src={MOCK_MEMES[1].imageUrl} 
                        alt="Meme" 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-background">
                    <Link to={`/battle/${battle.id}`}>
                      <Button variant="outline" className="w-full">View Battle</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Battle;
