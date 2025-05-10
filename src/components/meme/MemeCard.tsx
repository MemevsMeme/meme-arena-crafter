
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { Heart, MessageSquare, Share, Award } from 'lucide-react';
import { Meme } from '@/lib/types';
import MemeIpfsLink from '@/components/ui/MemeIpfsLink';
import { toast } from 'sonner';

interface MemeCardProps {
  meme: Meme;
  showActions?: boolean;
  inBattle?: boolean;
  isWinner?: boolean;
  onVote?: () => void;
  onShare?: () => void;
}

const MemeCard = ({
  meme,
  showActions = true,
  inBattle = false,
  isWinner = false,
  onVote,
  onShare
}: MemeCardProps) => {
  const [isVoted, setIsVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(meme.votes || 0);
  const [imageError, setImageError] = useState(false);

  const handleVote = () => {
    if (onVote) {
      onVote();
      return;
    }
    
    if (!isVoted) {
      setVoteCount(prev => prev + 1);
      setIsVoted(true);
    } else {
      setVoteCount(prev => prev - 1);
      setIsVoted(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: `Meme by ${meme.creator?.username || 'unknown'}`,
        text: meme.caption,
        url: window.location.href,
      })
      .catch(err => {
        console.error('Error sharing:', err);
        toast.success('Share URL copied to clipboard!');
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Share URL copied to clipboard!'))
        .catch(err => console.error('Could not copy URL:', err));
    }
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${meme.imageUrl}`);
    setImageError(true);
  };

  return (
    <div className={`meme-card shadow-md ${inBattle ? 'border-4' : 'border'} ${isWinner ? 'border-brand-orange' : 'border-border'}`}>
      {isWinner && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-brand-orange text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Award className="h-3 w-3" />
            Winner
          </div>
        </div>
      )}
      
      <div className="p-3 bg-background">
        <div className="flex justify-between items-center">
          {meme.creator && (
            <UserAvatar user={meme.creator} showUsername showLevel />
          )}
          
          <div className="text-xs text-muted-foreground">
            {new Date(meme.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <p className="mt-2 text-sm font-medium">
          {meme.prompt}
        </p>
      </div>
      
      <Link to={`/meme/${meme.id}`}>
        <div className="relative bg-muted aspect-square overflow-hidden">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground">Image unavailable</p>
            </div>
          ) : (
            <img
              src={meme.imageUrl}
              alt={meme.caption}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white font-medium text-center whitespace-pre-line">
              {meme.caption}
            </p>
          </div>
        </div>
      </Link>
      
      {showActions && (
        <div className="p-3 bg-background flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isVoted ? 'text-brand-orange' : ''}`}
              onClick={handleVote}
            >
              <Heart className={`h-4 w-4 ${isVoted ? 'fill-brand-orange' : ''}`} />
              <span>{voteCount}</span>
            </Button>
            
            <Link to={`/meme/${meme.id}`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>0</span>
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center">
            {meme.ipfsCid && <MemeIpfsLink ipfsCid={meme.ipfsCid} />}
            
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeCard;
