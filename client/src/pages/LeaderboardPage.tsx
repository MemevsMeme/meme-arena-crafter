import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { DailyChallenge, Meme } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, Clock, User, ThumbsUp, ArrowRight, Crown } from 'lucide-react';
import Header from '@/components/Header';

interface WinnerInfo {
  meme: Meme;
  username: string;
  profileImageUrl?: string;
  votes: number;
}

interface ChallengeWithWinner extends DailyChallenge {
  participantCount: number;
  winner?: WinnerInfo;
}

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [challenges, setChallenges] = useState<ChallengeWithWinner[]>([]);
  const [userBattles, setUserBattles] = useState<ChallengeWithWinner[]>([]);

  useEffect(() => {
    // Fetch all daily challenges
    const fetchChallenges = async () => {
      try {
        const response = await fetch('/api/daily-challenges');
        if (!response.ok) {
          throw new Error('Failed to fetch challenges');
        }
        const data = await response.json();
        
        // Process challenges to find winners for completed ones
        const processedChallenges = await Promise.all(
          data.map(async (challenge: DailyChallenge) => {
            const isCompleted = new Date() > new Date(challenge.endDate);
            let winner = undefined;
            
            if (isCompleted) {
              // For completed challenges, fetch memes to determine winner
              const memesResponse = await fetch(`/api/memes/challenge/${challenge.id}`);
              if (memesResponse.ok) {
                const memes = await memesResponse.json();
                
                if (memes && memes.length > 0) {
                  // Find meme with most likes
                  const topMeme = [...memes].sort((a, b) => b.likes - a.likes)[0];
                  
                  winner = {
                    meme: topMeme,
                    username: topMeme.username || 'Anonymous',
                    profileImageUrl: topMeme.profileImageUrl,
                    votes: topMeme.likes
                  };
                }
                
                return {
                  ...challenge,
                  participantCount: memes.length,
                  winner
                };
              }
            }
            
            return {
              ...challenge,
              participantCount: challenge.participantCount || 0,
              winner
            };
          })
        );
        
        setChallenges(processedChallenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      }
    };
    
    // Fetch all user battles
    const fetchUserBattles = async () => {
      try {
        const response = await fetch('/api/user-battles');
        if (!response.ok) {
          throw new Error('Failed to fetch user battles');
        }
        const data = await response.json();
        
        // Process battles to find winners for completed ones
        const processedBattles = await Promise.all(
          data.map(async (battle: DailyChallenge) => {
            const isCompleted = new Date() > new Date(battle.endDate);
            let winner = undefined;
            
            if (isCompleted) {
              // For completed battles, fetch memes to determine winner
              const memesResponse = await fetch(`/api/memes/challenge/${battle.id}`);
              if (memesResponse.ok) {
                const memes = await memesResponse.json();
                
                if (memes && memes.length > 0) {
                  // Find meme with most likes
                  const topMeme = [...memes].sort((a, b) => b.likes - a.likes)[0];
                  
                  winner = {
                    meme: topMeme,
                    username: topMeme.username || 'Anonymous',
                    profileImageUrl: topMeme.profileImageUrl,
                    votes: topMeme.likes
                  };
                }
                
                return {
                  ...battle,
                  participantCount: memes.length,
                  winner
                };
              }
            }
            
            return {
              ...battle,
              participantCount: battle.participantCount || 0,
              winner
            };
          })
        );
        
        setUserBattles(processedBattles);
      } catch (error) {
        console.error('Error fetching user battles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
    fetchUserBattles();
  }, []);

  // Sort challenges - completed first, then sorted by date
  const completedChallenges = challenges
    .filter(challenge => new Date() > new Date(challenge.endDate))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeChallenges = challenges
    .filter(challenge => new Date() <= new Date(challenge.endDate))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Sort user battles - completed first, then sorted by date
  const completedBattles = userBattles
    .filter(battle => new Date() > new Date(battle.endDate))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeBattles = userBattles
    .filter(battle => new Date() <= new Date(battle.endDate))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Leaderboard</h1>
          <Tabs defaultValue="daily" className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="daily" onClick={() => setActiveTab('daily')}>
                Daily Challenges
              </TabsTrigger>
              <TabsTrigger value="battles" onClick={() => setActiveTab('battles')}>
                User Battles
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === 'daily' ? (
          <>
            {completedChallenges.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Trophy className="h-6 w-6 mr-2 text-amber-500" />
                  Completed Challenges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedChallenges.map((challenge) => (
                    <CompletedChallengeCard key={challenge.id} challenge={challenge} isBattle={false} />
                  ))}
                </div>
              </div>
            )}

            {activeChallenges.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Active Challenges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeChallenges.map((challenge) => (
                    <ActiveChallengeCard key={challenge.id} challenge={challenge} isBattle={false} />
                  ))}
                </div>
              </div>
            )}

            {completedChallenges.length === 0 && activeChallenges.length === 0 && (
              <Card className="text-center p-6">
                <CardHeader>
                  <CardTitle>No Challenges Found</CardTitle>
                  <CardDescription>There are no challenges available right now.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </>
        ) : (
          <>
            {completedBattles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Trophy className="h-6 w-6 mr-2 text-amber-500" />
                  Completed Battles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedBattles.map((battle) => (
                    <CompletedChallengeCard key={battle.id} challenge={battle} isBattle={true} />
                  ))}
                </div>
              </div>
            )}

            {activeBattles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Active Battles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBattles.map((battle) => (
                    <ActiveChallengeCard key={battle.id} challenge={battle} isBattle={true} />
                  ))}
                </div>
              </div>
            )}

            {completedBattles.length === 0 && activeBattles.length === 0 && (
              <Card className="text-center p-6">
                <CardHeader>
                  <CardTitle>No Battles Found</CardTitle>
                  <CardDescription>There are no user-created battles available right now.</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button onClick={() => window.location.href = '/daily-challenge/create'}>
                    Create a Battle
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
};

// Card component for completed challenges with winner information
const CompletedChallengeCard = ({ challenge, isBattle }: { challenge: ChallengeWithWinner, isBattle: boolean }) => {
  const challengeUrl = isBattle 
    ? `/battles/${challenge.id}` 
    : `/daily-challenge/${challenge.id}`;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 p-3">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="bg-amber-500 text-white">Completed</Badge>
            <h3 className="font-bold mt-2 text-lg line-clamp-1">{challenge.title || challenge.promptText}</h3>
          </div>
          <Trophy className="h-6 w-6 text-amber-500" />
        </div>
      </div>
      
      <CardContent className="p-4">
        {challenge.winner ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-amber-500">
                <AvatarImage 
                  src={challenge.winner.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${challenge.winner.username || 'guest'}`} 
                />
                <AvatarFallback>{challenge.winner.username ? challenge.winner.username.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
              </Avatar>
              <Crown className="absolute -top-2 -right-2 h-5 w-5 text-amber-500" />
            </div>
            
            <div>
              <div className="font-bold flex items-center gap-1">
                {challenge.winner.username} 
                <Badge className="ml-1 bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Winner
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {challenge.participantCount} total {challenge.participantCount === 1 ? 'entry' : 'entries'}
              </div>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <ThumbsUp className="h-3 w-3" /> {challenge.winner.votes} votes
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No entries were submitted
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-950/20 p-3 flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" /> 
          {new Date(challenge.date).toLocaleDateString()}
        </div>
        <Button variant="link" size="sm" asChild>
          <Link to={challengeUrl}>
            View Details <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Card component for active challenges
const ActiveChallengeCard = ({ challenge, isBattle }: { challenge: ChallengeWithWinner, isBattle: boolean }) => {
  const challengeUrl = isBattle 
    ? `/battles/${challenge.id}` 
    : `/daily-challenge/${challenge.id}`;

  // Calculate time remaining
  const calculateTimeRemaining = () => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 p-3">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="bg-blue-500 text-white">Active</Badge>
            <h3 className="font-bold mt-2 text-lg line-clamp-1">{challenge.title || challenge.promptText}</h3>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{calculateTimeRemaining()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{challenge.participantCount} participants</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-950/20 p-3 flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" /> 
          {new Date(challenge.date).toLocaleDateString()}
        </div>
        <Button variant="link" size="sm" asChild>
          <Link to={challengeUrl}>
            Participate <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LeaderboardPage;