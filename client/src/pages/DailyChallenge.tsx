import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyChallengeWithMemes, Template } from "@shared/schema";
import { Calendar, Clock, Trophy, User, ArrowRight, Plus, X, ThumbsUp, Share2, Sparkles } from "lucide-react";
import MemeGenerator from "@/components/MemeGenerator";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";
import SocialShareButtons from "@/components/SocialShareButtons";
import CommentsSection from "@/components/CommentsSection";
import MemeDetailsModal from "@/components/MemeDetailsModal";
import GradientPromptCard from "@/components/GradientPromptCard";
import MemeLeaderboard from "@/components/MemeLeaderboard";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DailyChallenge() {
  const [_, setLocation] = useLocation();
  const [showMemeGenerator, setShowMemeGenerator] = useState(false);
  const [showSocialButtons, setShowSocialButtons] = useState<number | null>(null);
  const [selectedMeme, setSelectedMeme] = useState<number | null>(null);
  const promptRef = useRef<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch current daily challenge with memes
  const { 
    data: challenge, 
    isLoading,
    error 
  } = useQuery<DailyChallengeWithMemes>({
    queryKey: ['/api/daily-challenges/current'],
  });
  
  // Fetch templates for meme generator
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });
  
  // Like/vote mutation
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
      queryClient.invalidateQueries({ queryKey: ['/api/daily-challenges/current'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to vote',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    }
  });

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          </div>
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
          <h1 className="text-3xl font-bold mb-4">No Active Challenge</h1>
          <p className="text-gray-500 mb-8">
            There's no active daily challenge right now. Check back later or view past challenges.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setLocation('/daily-challenge/history')}>
              View Past Challenges
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Calculate stats
  const totalParticipants = challenge.participantCount || 0;
  const topMemes = challenge.memes 
    ? [...challenge.memes].sort((a, b) => b.likes - a.likes).slice(0, 3)
    : [];
  const recentMemes = challenge.memes
    ? [...challenge.memes].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 6)
    : [];

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 animate-fade-in">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4 animate-slide-up">Daily Challenge</h1>
              
              {/* Gradient prompt card */}
              <div className="mb-4 animate-scale">
                <GradientPromptCard 
                  title="Daily Challenge" 
                  prompt={challenge.promptText} 
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-4 animate-slide-in-right">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(challenge.date).toLocaleDateString()}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock size={14} />
                  {challenge.timeRemaining || "Ended"}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <User size={14} />
                  {totalParticipants} Participants
                </Badge>
                {challenge.category && (
                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200">
                    {challenge.category}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 md:flex-col lg:flex-row animate-slide-in-right">
              <Button 
                onClick={() => {
                  setShowMemeGenerator(true);
                  promptRef.current = challenge.promptText;
                }}
                className="animate-bounce-light"
              >
                <Plus size={16} className="mr-2" />
                Create Meme
              </Button>
              <Button variant="outline" onClick={() => setLocation('/daily-challenge/history')}>
                View All Challenges
              </Button>
              {user && (
                <Button 
                  variant="secondary" 
                  onClick={() => setLocation('/daily-challenge/create')}
                >
                  <Plus size={16} className="mr-2" />
                  Create Challenge
                </Button>
              )}
            </div>
          </div>
        </div>

        {showMemeGenerator && (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Meme for Challenge</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMemeGenerator(false)}>
                <X size={18} />
              </Button>
            </div>
            <MemeGenerator 
              templates={templates} 
              challengeId={challenge.id} 
              challengePrompt={challenge.promptText}
            />
          </div>
        )}
        
        {selectedMeme && (
          <MemeDetailsModal 
            memeId={selectedMeme} 
            onClose={() => setSelectedMeme(null)} 
            challengeId={challenge.id}
          />
        )}

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="top">Top Rated</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {recentMemes.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>No Submissions Yet</CardTitle>
                  <CardDescription>Be the first to submit a meme for this challenge!</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button onClick={() => setShowMemeGenerator(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Meme
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentMemes.map((meme, index) => (
                  <Card 
                    key={meme.id} 
                    className="overflow-hidden flex flex-col animate-fade-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="h-64 overflow-hidden relative animate-scale">
                      <img 
                        src={meme.imageUrl || meme.image_url} 
                        alt={meme.promptText || meme.prompt_text}
                        className="w-full h-full object-cover transition-transform hover:scale-105 cursor-pointer"
                        onClick={() => setSelectedMeme(meme.id)}
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
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-primary hover:bg-primary/10" 
                                  onClick={() => likeMutation.mutate(meme.id)}
                                  disabled={likeMutation.isPending}
                                >
                                  <ThumbsUp size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Vote for this meme</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <span className="font-medium">{meme.likes}</span>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => setShowSocialButtons(showSocialButtons === meme.id ? null : meme.id)}
                                >
                                  <Share2 size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Share this meme</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      {showSocialButtons === meme.id && (
                        <div className="mt-3 flex justify-end">
                          <SocialShareButtons 
                            url={`${window.location.origin}/daily-challenge/${challenge.id}?meme=${meme.id}`}
                            title={`Check out this meme for the "${challenge.promptText}" challenge!`}
                            size="icon"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="top">
            {topMemes.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>No Top Memes Yet</CardTitle>
                  <CardDescription>Be the first to submit and get votes!</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button onClick={() => setShowMemeGenerator(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Meme
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {topMemes.map((meme, index) => (
                  <Card key={meme.id} className={`overflow-hidden ${index === 0 ? 'ring-2 ring-amber-500' : ''}`}>
                    <div className="h-64 overflow-hidden relative">
                      {index === 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-amber-500">Top Rated</Badge>
                        </div>
                      )}
                      <img 
                        src={meme.imageUrl} 
                        alt={meme.promptText}
                        className="w-full h-full object-cover transition-transform hover:scale-105 cursor-pointer"
                        onClick={() => setSelectedMeme(meme.id)}
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={meme.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${meme.username || meme.userId || 'guest'}`} />
                            <AvatarFallback>{meme.username ? meme.username.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium">
                            {meme.username || "Anonymous"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-primary hover:bg-primary/10" 
                                  onClick={() => likeMutation.mutate(meme.id)}
                                  disabled={likeMutation.isPending}
                                >
                                  <ThumbsUp size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Vote for this meme</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <span className="font-medium flex items-center gap-1">
                            {index === 0 && <Trophy size={16} className="text-amber-500" />}
                            {meme.likes}
                          </span>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => setShowSocialButtons(showSocialButtons === meme.id ? null : meme.id)}
                                >
                                  <Share2 size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Share this meme</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      {showSocialButtons === meme.id && (
                        <div className="mt-3 flex justify-end">
                          <SocialShareButtons 
                            url={`${window.location.origin}/daily-challenge/${challenge.id}?meme=${meme.id}`}
                            title={`Check out this meme for the "${challenge.promptText}" challenge!`}
                            size="icon"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link href={`/daily-challenge/${challenge.id}`}>
                <Button variant="outline">
                  View All Results
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <MemeLeaderboard 
              memes={challenge.memes || []}
              isEnded={new Date() > new Date(challenge.endDate)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}