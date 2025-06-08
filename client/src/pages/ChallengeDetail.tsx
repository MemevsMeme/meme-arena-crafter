import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyChallengeWithMemes } from "@shared/schema";
import { Calendar, Clock, Trophy, User, ThumbsUp, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import SocialShareButtons from "@/components/SocialShareButtons";

export default function ChallengeDetail() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/daily-challenge/:id");
  const [activeTab, setActiveTab] = useState("gallery");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const challengeId = params?.id ? parseInt(params.id) : null;

  // Fetch challenge with memes
  const { 
    data: challenge, 
    isLoading,
    error,
    refetch 
  } = useQuery<DailyChallengeWithMemes>({
    queryKey: ['/api/daily-challenges', challengeId],
    enabled: !!challengeId,
  });
  
  // Force a refetch when the component mounts or challengeId changes
  useEffect(() => {
    if (challengeId) {
      console.log(`Fetching challenge details for ID: ${challengeId}`);
      refetch();
    }
  }, [challengeId, refetch]);
  
  const [memeData, setMemeData] = useState<any[]>([]);
  
  useEffect(() => {
    if (challenge?.memes) {
      console.log("Challenge memes found:", challenge.memes.length);
      console.log("Meme data:", challenge.memes);
      setMemeData(challenge.memes);
    } else {
      console.log("No memes found in challenge data");
      // If we have a challenge ID but no memes in the challenge, fetch them directly
      if (challengeId) {
        fetch(`/api/memes/challenge/${challengeId}`)
          .then(res => res.json())
          .then(data => {
            console.log("Fetched memes directly:", data.length);
            setMemeData(data);
          })
          .catch(err => console.error("Error fetching memes:", err));
      }
    }
  }, [challenge, challengeId]);
  
  // Vote for a meme
  const voteMutation = useMutation({
    mutationFn: async (memeId: number) => {
      const response = await fetch(`/api/memes/${memeId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote for meme');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch challenge data to update the likes count
      queryClient.invalidateQueries({
        queryKey: ['/api/daily-challenges', challengeId]
      });
      
      toast({
        title: 'Vote successful',
        description: 'Your vote has been counted!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to vote',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Handle meme voting
  const handleVote = (memeId: number) => {
    voteMutation.mutate(memeId);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft size={20} />
            </Button>
            <Skeleton className="h-10 w-64 ml-2" />
          </div>
          <Skeleton className="h-[400px] w-full mb-4" />
        </div>
      </>
    );
  }

  // Handle error state
  if (error || !challenge) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Challenge Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The challenge you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setLocation('/daily-challenge')}>
              Back to Current Challenge
            </Button>
            <Button variant="outline" onClick={() => setLocation('/daily-challenge/history')}>
              View All Challenges
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Safely handle challenge data
  const memes = challenge.memes || [];
  const isEnded = challenge.endDate ? new Date(challenge.endDate) < new Date() : false;
  
  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/daily-challenge")}>
            <ArrowLeft size={20} />
          </Button>
          <div className="ml-2">
            <h1 className="text-2xl md:text-3xl font-bold">{challenge.promptText}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-muted-foreground">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar size={14} />
                {challenge.date ? new Date(challenge.date).toLocaleDateString() : "N/A"}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock size={14} />
                {challenge.timeRemaining || "Ended"}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <User size={14} />
                {challenge.participantCount || memes.length} Participants
              </Badge>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <Button onClick={() => setLocation(`/create?challenge=${challenge.id}&prompt=${encodeURIComponent(challenge.promptText)}`)}>
            <Plus size={16} className="mr-2" />
            Submit Meme
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gallery">
            {memeData.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>No Submissions Yet</CardTitle>
                  <CardDescription>
                    Be the first to submit a meme for this challenge!
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button onClick={() => setLocation(`/create?challenge=${challenge.id}&prompt=${encodeURIComponent(challenge.promptText)}`)}>
                    <Plus size={16} className="mr-2" />
                    Create Meme
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {memeData.map((meme) => (
                  <Card key={meme.id} className="overflow-hidden">
                    <div className="h-60 overflow-hidden">
                      <img 
                        src={meme.imageUrl} 
                        alt={meme.promptText}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={meme.profileImageUrl || `https://api.dicebear.com/7.x/${meme.avatarStyle || 'avataaars'}/svg?seed=${meme.username || meme.userId || 'guest'}`} />
                            <AvatarFallback>{meme.username ? meme.username.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{meme.username || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              voteMutation.mutate(meme.id);
                            }}
                            className="flex items-center p-1 h-8"
                            disabled={voteMutation.isPending}
                          >
                            <ThumbsUp size={14} className="mr-1" />
                            Vote
                          </Button>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>{meme.likes}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <SocialShareButtons 
                          url={`${window.location.origin}/daily-challenge/${challenge.id}?meme=${meme.id}`}
                          title={`Check out this meme: ${meme.promptText}`}
                          size="icon"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Top Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {memes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No submissions yet</p>
                ) : (
                  <div className="space-y-4">
                    {[...memes].sort((a, b) => b.likes - a.likes).map((meme, index) => (
                      <div 
                        key={meme.id} 
                        className="flex items-center space-x-4 p-3 rounded-lg"
                      >
                        <div className="flex-shrink-0 font-bold text-muted-foreground w-6 text-center">
                          #{index + 1}
                        </div>
                        <div className="flex-shrink-0 h-12 w-12 rounded overflow-hidden">
                          <img src={meme.imageUrl} alt={meme.promptText} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={meme.profileImageUrl || `https://api.dicebear.com/7.x/${meme.avatarStyle || 'avataaars'}/svg?seed=${meme.username || meme.userId || 'guest'}`} />
                              <AvatarFallback>{meme.username ? meme.username.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium truncate">
                              {meme.username || "Anonymous"}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {meme.promptText?.substring(0, 20)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              voteMutation.mutate(meme.id);
                            }}
                            className="flex items-center"
                            disabled={voteMutation.isPending}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" /> 
                            Vote
                          </Button>
                          <Badge>
                            {meme.likes} likes
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}