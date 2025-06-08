import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Send } from "lucide-react";
// @ts-ignore
import { Comment } from "@shared/schema";

// This is a flexible type that handles both snake_case (from DB) and camelCase (from frontend)
interface DbComment {
  id: number;
  meme_id?: number;
  memeId?: number;
  user_id?: number | null;
  userId?: number | null;
  text: string;
  created_at?: string;
  createdAt?: string;
  username?: string;
  profile_image_url?: string;
  profileImageUrl?: string;
  avatar_seed?: string;
  avatarSeed?: string;
  avatar_style?: string;
  avatarStyle?: string;
}

interface CommentsSectionProps {
  memeId: number;
}

export default function CommentsSection({ memeId }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch comments for this meme
  const { data: comments = [], isLoading } = useQuery<DbComment[]>({
    queryKey: ['/api/memes', memeId, 'comments'],
    queryFn: async () => {
      const res = await fetch(`/api/memes/${memeId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
  });
  
  // Mutation for adding a new comment
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/memes/${memeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!res.ok) throw new Error('Failed to add comment');
      return res.json();
    },
    onSuccess: () => {
      // Clear the input and invalidate comments query to refresh
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ['/api/memes', memeId, 'comments'] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addCommentMutation.mutate(commentText.trim());
  };
  
  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Format date for display
  const formatDate = (dateStr: string | Date | undefined) => {
    try {
      if (!dateStr) return 'Unknown date';
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-medium">Comments</h3>
      
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1"
          disabled={addCommentMutation.isPending}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!commentText.trim() || addCommentMutation.isPending}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
      
      {/* Comments list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={
                        comment.profileImageUrl || comment.profile_image_url || 
                        `https://api.dicebear.com/7.x/${comment.avatarStyle || comment.avatar_style || 'avataaars'}/svg?seed=${comment.avatarSeed || comment.avatar_seed || comment.username || comment.userId || comment.user_id || 'guest'}`
                      } 
                      alt={comment.username || "Anonymous"} 
                    />
                    <AvatarFallback>{getInitials(comment.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{comment.username || "Anonymous"}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt || comment.created_at || new Date())}</span>
                    </div>
                    <p className="mt-1">{comment.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}