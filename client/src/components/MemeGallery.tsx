import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Meme } from "@shared/schema";
import MemeDetailsModal from "@/components/MemeDetailsModal";

interface MemeGalleryProps {
  memes: Meme[];
  onVote: (memeId: number) => void | Promise<void>;
  showChallenge?: boolean;
}

const MemeGallery = ({ memes, onVote, showChallenge = true }: MemeGalleryProps) => {
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme);
    setDetailsOpen(true);
  };
  
  if (memes.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-xl font-medium mb-3">No memes submitted yet!</h3>
        <p className="text-muted-foreground mb-6">Be the first to create a meme for this challenge</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memes.map((meme) => (
          <Card key={meme.id} className="overflow-hidden flex flex-col h-full animate-fade-in">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer"
                 onClick={() => handleMemeClick(meme)}>
              <img
                src={meme.imageUrl}
                alt={meme.promptText}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-4 flex-grow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={meme.profileImageUrl || `https://api.dicebear.com/7.x/${meme.avatarStyle || 'avataaars'}/svg?seed=${meme.avatarSeed || meme.id}`} />
                    <AvatarFallback>{meme.username?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {meme.username || 'Anonymous User'}
                  </span>
                </div>
                {showChallenge && meme.dailyChallengeId && (
                  <Badge variant="outline" className="text-xs">
                    Challenge
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{meme.promptText}</p>
            </CardContent>
            <CardFooter className="px-4 py-3 border-t flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs gap-1 hover:text-primary" 
                onClick={() => onVote(meme.id)}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{meme.likes || 0}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs gap-1" 
                onClick={() => handleMemeClick(meme)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Comment</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedMeme && (
        <MemeDetailsModal
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          meme={selectedMeme}
        />
      )}
    </div>
  );
};

export default MemeGallery;