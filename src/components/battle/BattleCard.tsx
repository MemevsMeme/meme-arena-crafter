
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Battle, Meme } from '@/lib/types';
import { MOCK_MEMES, MOCK_PROMPTS } from '@/lib/constants';

interface BattleCardProps {
  battle: Battle;
  compact?: boolean;
  memeOne?: Meme;
  memeTwo?: Meme;
}

const BattleCard = ({ battle, compact = false, memeOne, memeTwo }: BattleCardProps) => {
  // For the MVP, we'll use mock data if real data isn't provided
  const memeOneData = memeOne || MOCK_MEMES.find(m => m.id === battle.memeOneId) || MOCK_MEMES[0];
  const memeTwoData = memeTwo || MOCK_MEMES.find(m => m.id === battle.memeTwoId) || MOCK_MEMES[1];
  
  // Find prompt data - use battle.prompt if it exists, otherwise look up by ID, or use a default
  const promptData = battle.prompt || 
                    (battle.promptId ? MOCK_PROMPTS.find(p => p.id === battle.promptId) : null) || 
                    { text: "Today's meme challenge" };
  
  const timeRemaining = battle.endTime.getTime() - Date.now();
  const isActive = battle.status === 'active' && timeRemaining > 0;
  
  const formatTimeRemaining = () => {
    if (!isActive) return 'Ended';
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };
  
  if (compact) {
    return (
      <Link to={`/battle/${battle.id}`}>
        <div className="battle-card flex hover:scale-[102%] transition-transform duration-200">
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute top-0 left-0 bg-black/50 p-1 text-white text-xs">
              {battle.voteCount} votes
            </div>
            <img
              src={memeOneData.imageUrl}
              alt="Meme One"
              className="w-full h-32 object-cover"
            />
          </div>
          <div className="p-2 flex flex-col justify-center items-center bg-muted">
            <span className="font-bold">VS</span>
            {isActive && <span className="text-[10px]">LIVE</span>}
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute top-0 right-0 bg-black/50 p-1 text-white text-xs">
              {battle.voteCount} votes
            </div>
            <img
              src={memeTwoData.imageUrl}
              alt="Meme Two"
              className="w-full h-32 object-cover"
            />
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <div className="battle-card p-4">
      <div className="mb-3 flex justify-between items-center">
        <h3 className="font-bold text-lg">Meme Battle</h3>
        <div className={`px-2 py-1 text-xs rounded-full ${isActive ? 'bg-brand-orange text-white' : 'bg-muted text-muted-foreground'}`}>
          {formatTimeRemaining()}
        </div>
      </div>
      
      <p className="text-sm mb-4 text-muted-foreground">
        {promptData?.text || "Today's prompt challenge"}
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="aspect-square rounded-lg overflow-hidden mb-2">
            <img
              src={memeOneData.imageUrl}
              alt="Meme One"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-medium text-center">
            {memeOneData.caption?.split('\n')[0] || ''}
          </p>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="bg-muted rounded-full p-3 text-xl font-bold">
            VS
          </div>
        </div>
        
        <div className="flex-1">
          <div className="aspect-square rounded-lg overflow-hidden mb-2">
            <img
              src={memeTwoData.imageUrl}
              alt="Meme Two"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-medium text-center">
            {memeTwoData.caption?.split('\n')[0] || ''}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{battle.voteCount}</span> votes
        </div>
        
        <Link to={`/battle/${battle.id}`}>
          <Button className="flex items-center gap-1">
            Vote Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BattleCard;
