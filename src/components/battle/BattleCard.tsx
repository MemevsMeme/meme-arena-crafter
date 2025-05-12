
import React from 'react';
import { Link } from 'react-router-dom';
import { Battle } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';

interface BattleCardProps {
  battle: Battle;
  compact?: boolean;
}

const BattleCard = ({ battle, compact = false }: BattleCardProps) => {
  // Calculate time remaining
  const timeRemaining = new Date(battle.endTime).getTime() - Date.now();
  const isActive = battle.status === 'active' && timeRemaining > 0;
  
  // Calculate vote percentages
  const totalVotes = battle.voteCount || 0;
  
  // Default 50/50 if no votes yet, otherwise calculate based on winner if completed
  let leftPercent = 50;
  let rightPercent = 50;
  
  if (battle.status === 'completed' && battle.winnerId) {
    leftPercent = battle.winnerId === battle.memeOneId ? 60 : 40;
    rightPercent = 100 - leftPercent;
  }
  
  if (compact) {
    return (
      <Card className="overflow-hidden">
        <Link to={`/battle/${battle.id}`}>
          <div className="p-3 border-b bg-muted/50">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium truncate mr-2">{battle.promptId || "Meme Battle"}</h3>
              {isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                  <span className="w-2 h-2 mr-1 rounded-full bg-green-500"></span>
                  Live
                </span>
              )}
            </div>
          </div>
          
          <div className="flex">
            <div className="w-1/2 relative">
              {battle.memeOne && battle.memeOne.imageUrl ? (
                <img 
                  src={battle.memeOne.imageUrl} 
                  alt="First meme" 
                  className="w-full h-24 object-cover" 
                />
              ) : (
                <div className="w-full h-24 bg-muted flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            
            <div className="w-1/2 relative">
              {battle.memeTwo && battle.memeTwo.imageUrl ? (
                <img 
                  src={battle.memeTwo.imageUrl} 
                  alt="Second meme" 
                  className="w-full h-24 object-cover" 
                />
              ) : (
                <div className="w-full h-24 bg-muted flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
          </div>
          
          <div className="p-3">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
              <span>{totalVotes} votes</span>
              <span>
                {isActive ? (
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(battle.endTime), { addSuffix: true })}
                  </span>
                ) : (
                  battle.status
                )}
              </span>
            </div>
            <Progress value={leftPercent} className="h-1 mb-2" />
            <Button variant="outline" size="sm" className="w-full">
              View Battle
            </Button>
          </div>
        </Link>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <Link to={`/battle/${battle.id}`}>
        <div className="p-4 border-b bg-muted/50">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{battle.promptId || "Meme Battle"}</h3>
            {isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-1 rounded-full bg-green-500"></span>
                Live
              </span>
            )}
          </div>
        </div>
        
        <div className="flex">
          <div className="w-1/2 relative">
            {battle.memeOne && battle.memeOne.imageUrl ? (
              <img 
                src={battle.memeOne.imageUrl} 
                alt="First meme" 
                className="w-full h-48 object-cover" 
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white">
              {battle.memeOne && battle.memeOne.caption && (
                <p className="text-xs truncate">{battle.memeOne.caption}</p>
              )}
            </div>
          </div>
          
          <div className="w-1/2 relative">
            {battle.memeTwo && battle.memeTwo.imageUrl ? (
              <img 
                src={battle.memeTwo.imageUrl} 
                alt="Second meme" 
                className="w-full h-48 object-cover" 
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white">
              {battle.memeTwo && battle.memeTwo.caption && (
                <p className="text-xs truncate">{battle.memeTwo.caption}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex space-x-4">
              {battle.memeOne && battle.memeOne.creatorId && (
                <UserAvatar user={{ id: battle.memeOne.creatorId }} showUsername />
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium">{totalVotes} votes</span>
            </div>
            <div className="flex space-x-4 justify-end">
              {battle.memeTwo && battle.memeTwo.creatorId && (
                <UserAvatar user={{ id: battle.memeTwo.creatorId }} showUsername />
              )}
            </div>
          </div>
          
          <Progress value={leftPercent} className="h-2 mb-4" />
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {isActive ? (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDistanceToNow(new Date(battle.endTime), { addSuffix: true })}
                </span>
              ) : (
                battle.status === 'completed' ? 'Battle completed' : battle.status
              )}
            </span>
            <Button>View Battle</Button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default BattleCard;
