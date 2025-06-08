import { useState } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Meme } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import MemeSoundPlayer from "./MemeSoundPlayer";

interface MemeCardProps {
  meme: Meme;
  rank?: number;
  showVoteButton?: boolean;
  onVote?: () => void;
  isWinner?: boolean;
  isVoted?: boolean;
  showActions?: boolean;
  className?: string;
}

const MemeCard = ({
  meme,
  rank,
  showVoteButton = false,
  onVote,
  isWinner = false,
  isVoted = false,
  showActions = false,
  className,
}: MemeCardProps) => {
  // Check for sound effects
  const hasSounds = meme.soundEffects && meme.soundEffects.length > 0;
  return (
    <div 
      className={cn(
        "meme-card flex-1 bg-white p-4 rounded-xl shadow-lg overflow-hidden",
        isWinner && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      <div className="relative pb-4">
        {rank && (
          <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            Meme #{meme.id}
          </div>
        )}
        
        {hasSounds && meme.soundEffects && meme.soundEffects[0] && (
          <MemeSoundPlayer
            soundUrl={meme.soundEffects[0]}
            className="absolute top-2 right-2 z-10"
          />
        )}
        
        <img 
          src={meme.imageUrl} 
          alt={meme.promptText}
          className="w-full h-auto rounded-lg object-cover aspect-square"
          style={{ cursor: hasSounds ? 'pointer' : 'default' }}
        />
        <div className="mt-4">
          <p className="font-medium text-lg">"{meme.promptText}"</p>
          <div className="flex items-center mt-2 text-gray-500 text-sm">
            <span className="flex items-center mr-3">
              <i className="ri-eye-line mr-1"></i> {formatNumber(meme.views)}
            </span>
            <span className="flex items-center mr-3">
              <i className="ri-heart-line mr-1"></i> {formatNumber(meme.likes)}
            </span>
            {rank && (
              <span className="flex items-center">
                <i className="ri-trophy-line mr-1"></i> Rank #{rank}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {showVoteButton && (
        <button 
          className={cn(
            "vote-button w-full py-3 text-white rounded-lg font-medium text-lg hover:opacity-95 flex items-center justify-center",
            isVoted 
              ? "bg-green-500" 
              : "bg-gradient-to-r from-primary to-secondary"
          )}
          onClick={onVote}
          disabled={isVoted}
        >
          {isVoted ? (
            <>
              <i className="ri-check-line mr-2 text-xl"></i> Voted!
            </>
          ) : (
            <>
              <i className="ri-thumb-up-line mr-2 text-xl"></i> Vote This One
            </>
          )}
        </button>
      )}

      {showActions && (
        <div className="flex items-center justify-between mt-2">
          <button className="text-gray-500 hover:text-primary transition mr-2">
            <i className="ri-share-line"></i>
          </button>
          <button className="text-gray-500 hover:text-primary transition">
            <i className="ri-heart-line"></i>
          </button>
        </div>
      )}
      
      {/* Sound effect indicator */}
      {hasSounds && (
        <div className="mt-2 text-xs flex items-center text-gray-500">
          <Volume2 className="h-3 w-3 mr-1" /> 
          Has sound effects
        </div>
      )}
    </div>
  );
};

export default MemeCard;
