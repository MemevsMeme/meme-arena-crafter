import React from 'react';
import { Meme } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, Trophy, Medal, Award, Crown, Star } from 'lucide-react';
import AchievementRibbon from './AchievementRibbon';

interface MemeLeaderboardProps {
  memes: Meme[];
  isEnded: boolean;
}

const MemeLeaderboard = ({ memes, isEnded }: MemeLeaderboardProps) => {
  // Sort memes by likes in descending order
  const sortedMemes = [...memes].sort((a, b) => b.likes - a.likes);
  
  // Top 3 memes get special treatment
  const topMemes = sortedMemes.slice(0, 3);
  // The rest up to 10
  const runnerUps = sortedMemes.slice(3, 10);

  if (memes.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle>No Submissions Yet</CardTitle>
          <CardDescription>
            {isEnded 
              ? "This challenge ended with no submissions."
              : "Be the first to submit a meme for this challenge!"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Different display for ended vs active challenges
  return (
    <div className="space-y-6">
      {isEnded && (
        <Card className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Badge className="bg-amber-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                Challenge Completed
              </Badge>
              <h3 className="text-xl font-bold mt-2">Final Results</h3>
            </div>
            
            {topMemes.length > 0 && (
              <div className="flex flex-col items-center">
                <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                <p className="text-lg font-medium">Winner</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Avatar className="h-10 w-10 border-2 border-amber-500">
                    <AvatarImage src={topMemes[0].profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topMemes[0].username || topMemes[0].userId || 'guest'}`} />
                    <AvatarFallback>{topMemes[0].username ? topMemes[0].username.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{topMemes[0].username || "Anonymous"}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>{topMemes[0].likes} votes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className={`grid gap-6 ${isEnded ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {topMemes.map((meme, index) => (
          <Card 
            key={meme.id} 
            className={`overflow-hidden ${index === 0 ? 'ring-2 ring-amber-500' : index === 1 ? 'ring-2 ring-slate-400' : index === 2 ? 'ring-2 ring-amber-800' : ''}`}
          >
            <div className="h-48 overflow-hidden relative">
              {index === 0 && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-amber-500">🏆 1st Place</Badge>
                </div>
              )}
              {index === 1 && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-slate-500">🥈 2nd Place</Badge>
                </div>
              )}
              {index === 2 && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-amber-800">🥉 3rd Place</Badge>
                </div>
              )}
              
              {/* Position achievement ribbons based on placement */}
              {index === 0 && (
                <AchievementRibbon 
                  type="challenge-winner" 
                  position="bottom-right" 
                  tooltipText="Challenge Winner" 
                />
              )}
              {index === 1 && (
                <AchievementRibbon 
                  type="silver" 
                  position="bottom-right" 
                  tooltipText="Silver Medal" 
                />
              )}
              {index === 2 && (
                <AchievementRibbon 
                  type="bronze" 
                  position="bottom-right" 
                  tooltipText="Bronze Medal" 
                />
              )}
              <img 
                src={meme.imageUrl || meme.image_url} 
                alt={meme.promptText || meme.prompt_text} 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={meme.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${meme.username || meme.userId || 'guest'}`} />
                    <AvatarFallback>{meme.username ? meme.username.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{meme.username || "Anonymous"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp size={14} className="text-amber-500" />
                  <span className="font-bold">{meme.likes}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {runnerUps.length > 0 && (
        <>
          <h3 className="text-lg font-medium mt-8 mb-4">Runner Ups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {runnerUps.map((meme, index) => (
              <Card key={meme.id} className="overflow-hidden">
                <div className="h-32 overflow-hidden">
                  <img 
                    src={meme.imageUrl || meme.image_url} 
                    alt={meme.promptText || meme.prompt_text} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={meme.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${meme.username || meme.userId || 'guest'}`} />
                        <AvatarFallback>{meme.username ? meme.username.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{meme.username || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={12} className="text-muted-foreground" />
                      <span className="text-xs font-medium">{meme.likes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MemeLeaderboard;