import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ThumbsUp, Eye, Share2, X } from "lucide-react";
import { Meme } from "@shared/schema";
import SocialShareButtons from "./SocialShareButtons";
import { useToast } from "@/hooks/use-toast";
import CommentsSection from "./CommentsSection";
import { queryClient } from "@/lib/queryClient";

interface MemeDetailsModalProps {
  memeId?: number | null;
  meme?: Meme | null;
  onClose: () => void;
  challengeId?: number;
  isOpen?: boolean;
}

export default function MemeDetailsModal({ memeId, meme: propMeme, onClose, challengeId, isOpen = true }: MemeDetailsModalProps) {
  const [showSocialButtons, setShowSocialButtons] = useState(false);
  const { toast } = useToast();
  
  // Auto-close if memeId is null and no prop meme
  useEffect(() => {
    if (memeId === null && !propMeme) {
      onClose();
    }
  }, [memeId, propMeme, onClose]);
  
  // Don't render if no meme id or prop meme or not open
  if (!isOpen || (memeId === null && !propMeme)) return null;
  
  // Fetch meme details if we have a memeId but no meme prop
  const { data: fetchedMeme, isLoading } = useQuery<Meme>({
    queryKey: ['/api/memes', memeId],
    queryFn: async () => {
      const res = await fetch(`/api/memes/${memeId}`);
      if (!res.ok) throw new Error('Failed to fetch meme');
      const data = await res.json();
      // Ensure compatibility with both prompt_text and promptText
      if (data.prompt_text && !data.promptText) {
        data.promptText = data.prompt_text;
      }
      // Ensure compatibility with both created_at and createdAt
      if (data.created_at && !data.createdAt) {
        data.createdAt = data.created_at;
      }
      // Ensure compatibility with both image_url and imageUrl
      if (data.image_url && !data.imageUrl) {
        data.imageUrl = data.image_url;
      }
      return data;
    },
    enabled: !!memeId && !propMeme,
  });
  
  // Use prop meme if provided, otherwise use fetched meme
  const meme = propMeme || fetchedMeme;
  
  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (memeId: number) => {
      const response = await fetch(`/api/memes/${memeId}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to like meme');
      }
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate queries that might contain this meme
      queryClient.invalidateQueries({ queryKey: ['/api/memes', memeId] });
      
      if (challengeId) {
        queryClient.invalidateQueries({ queryKey: ['/api/daily-challenges/current'] });
        queryClient.invalidateQueries({ queryKey: ['/api/memes/challenge', challengeId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/memes'] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      
      toast({
        title: 'Success!',
        description: 'Your vote has been counted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to vote',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    }
  });
  
  // Loading state
  if (isLoading || !meme) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Meme Details</DialogTitle>
            <DialogDescription>Loading...</DialogDescription>
          </DialogHeader>
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-32 w-full" />
        </DialogContent>
      </Dialog>
    );
  }
  
  // Format the URL for sharing
  const shareUrl = challengeId
    ? `${window.location.origin}/daily-challenge/${challengeId}?meme=${meme.id}`
    : `${window.location.origin}/meme/${meme.id}`;
  
  const shareTitle = `Check out this meme: "${meme.promptText}"`;
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl">Meme Details</DialogTitle>
            <DialogDescription className="text-sm mt-1 line-clamp-2">
              {meme.promptText}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X size={18} />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Meme image */}
          <div className="flex justify-center">
            <img 
              src={meme.imageUrl || meme.image_url} 
              alt={meme.promptText || meme.prompt_text}
              className="max-h-[500px] max-w-full object-contain rounded-lg shadow-md"
            />
          </div>
          
          {/* User info and stats */}
          <div className="flex justify-between items-center p-2 border bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={
                    meme.profileImageUrl || meme.profile_image_url || 
                    `https://api.dicebear.com/7.x/${meme.avatarStyle || meme.avatar_style || 'avataaars'}/svg?seed=${meme.avatarSeed || meme.avatar_seed || meme.username || meme.userId || meme.user_id || 'guest'}`
                  } 
                  alt={meme.username || "User"}
                />
                <AvatarFallback>{meme.username ? meme.username.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">
                  {meme.username || (meme.userId || meme.user_id ? `Creator #${meme.userId || meme.user_id}` : "Anonymous")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {meme.createdAt || meme.created_at ? 
                    new Date(meme.createdAt || meme.created_at).toLocaleDateString() : 
                    "Recently created"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye size={14} />
                <span>{meme.views}</span>
              </Badge>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => likeMutation.mutate(meme.id)}
                  disabled={likeMutation.isPending}
                >
                  <ThumbsUp size={16} />
                  <span>{meme.likes}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSocialButtons(!showSocialButtons)}
                >
                  <Share2 size={16} className="mr-1" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Social share buttons */}
          {showSocialButtons && (
            <Card className="p-4">
              <CardContent className="p-0 flex justify-center">
                <SocialShareButtons 
                  url={shareUrl}
                  title={shareTitle}
                  size="sm"
                />
              </CardContent>
            </Card>
          )}
          
          {/* If the meme is part of a challenge, show badge */}
          {meme.dailyChallengeId && (
            <div>
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                Daily Challenge Submission
              </Badge>
            </div>
          )}
          
          {/* Comments section */}
          <div className="bg-muted/20 p-4 rounded-lg">
            <CommentsSection memeId={meme.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}