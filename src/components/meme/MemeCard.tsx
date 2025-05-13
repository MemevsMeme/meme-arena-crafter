import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { Heart, MessageSquare, Share, Award, AlertCircle } from 'lucide-react';
import { Meme } from '@/lib/types';
import MemeIpfsLink from '@/components/ui/MemeIpfsLink';
import { toast } from '@/hooks/use-toast';

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
  const [isImageLoading, setIsImageLoading] = useState(true);

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
        toast("Link Copied", {
          description: "Share URL copied to clipboard!"
        });
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast("Link Copied", {
          description: "Share URL copied to clipboard!"
        }))
        .catch(err => console.error('Could not copy URL:', err));
    }
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${meme.imageUrl}`);
    setImageError(true);
    setIsImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Format the created date for display
  const formattedDate = meme.createdAt instanceof Date 
    ? meme.createdAt.toLocaleDateString()
    : new Date(meme.createdAt).toLocaleDateString();

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
            {formattedDate}
          </div>
        </div>
        
        {meme.prompt && (
          <p className="mt-2 text-sm font-medium">
            {meme.prompt}
          </p>
        )}
      </div>
      
      <Link to={`/meme/${meme.id}`}>
        <div className="relative bg-muted aspect-square overflow-hidden">
          {isImageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="loading-spinner h-8 w-8 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin"></div>
            </div>
          )}
          
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4">
              <AlertCircle className="h-8 w-8 mb-2 text-amber-500" />
              <p className="text-center">Image unavailable</p>
              <p className="text-xs text-center mt-1">"{meme.caption}"</p>
            </div>
          ) : (
            <img
              src={meme.imageUrl}
              alt={meme.caption}
              className="w-full h-full object-contain"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
          
          {!imageError && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white font-medium text-center whitespace-pre-line">
                {meme.caption}
              </p>
            </div>
          )}
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
