import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CalendarDays, Clock, Users, Zap, Plus, ThumbsUp, Share2, X } from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyChallenge, Meme } from "@shared/schema";
import MemeGenerator from "@/components/MemeGenerator";
import MemeGallery from "@/components/MemeGallery";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MemeDetailsModal from "@/components/MemeDetailsModal";
import GradientPromptCard from "@/components/GradientPromptCard";
import MemeLeaderboard from "@/components/MemeLeaderboard";

export default function BattleDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("gallery");
  const [topRatedMemes, setTopRatedMemes] = useState<Meme[]>([]);
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [selectedMeme, setSelectedMeme] = useState<number | null>(null);
  const [showSocialButtons, setShowSocialButtons] = useState<number | null>(null);

  // Fetch battle details
  const { data: challenge, isLoading: isLoadingChallenge } = useQuery({
    queryKey: ['/api/battles', id],
    queryFn: async () => {
      const res = await fetch(`/api/battles/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch battle details');
      }
      return res.json();
    },
  });
  
  // Fetch battle memes
  const { data: memeData = [], isLoading: isLoadingMemes } = useQuery({
    queryKey: ['/api/battles', id, 'memes'],
    queryFn: async () => {
      // First try to get memes from challenge data
      if (challenge?.memes && challenge.memes.length > 0) {
        console.log("Using memes from challenge data:", challenge.memes.length);
        return challenge.memes;
      }
      
      console.log("No memes found in challenge data");
      
      // Fall back to direct fetch if challenge doesn't have memes property
      const res = await fetch(`/api/memes/challenge/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch battle memes');
      }
      const memes = await res.json();
      console.log("Fetched memes directly:", memes.length);
      return memes;
    },
    enabled: !!challenge,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (memeId: number): Promise<any> => {
      const response = await fetch(`/api/memes/${memeId}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to vote for meme');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/battles', id, 'memes'] });
      toast({
        title: "Vote submitted!",
        description: "Your vote has been counted."
      });
    },
    onError: () => {
      toast({
        title: "Failed to vote",
        description: "There was an error processing your vote.",
        variant: "destructive"
      });
    }
  });

  // Calculate remaining time
  useEffect(() => {
    if (!challenge) return;
    
    const calculateTimeRemaining = () => {
      const endDate = new Date(challenge.endDate);
      const now = new Date();
      
      if (now > endDate) {
        setRemainingTime("Closed");
        return;
      }
      
      const diffInMs = endDate.getTime() - now.getTime();
      const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setRemainingTime(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setRemainingTime(`${hours}h ${minutes}m remaining`);
      } else {
        setRemainingTime(`${minutes}m remaining`);
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, [challenge]);

  if (isLoadingChallenge) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container py-8">
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Battle Not Found</CardTitle>
            <CardDescription>
              The battle you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => setLocation("/battles")}>
              View All Battles
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isBattleClosed = new Date() > new Date(challenge.endDate);
  
  return (
    <>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-6">User Battle</h1>
        
        <GradientPromptCard
          title="User Battle"
          prompt={challenge.title}
          metadata={[
            { icon: <CalendarDays size={14} />, text: new Date(challenge.createdAt).toLocaleDateString() },
            { icon: <Clock size={14} />, text: remainingTime },
            { icon: <Users size={14} />, text: `${challenge.participantCount || memeData.length || 0} Participants` },
          ]}
          tag={challenge.promptText}
          className="mb-8"
        />

        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            {!isBattleClosed && (
              <Button
                onClick={() => setActiveTab("create")}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center"
                size="lg"
              >
                <Plus size={18} className="mr-2" />
                Create Meme
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/battles")}
            >
              View All Battles
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="bg-muted/20 rounded-full p-1 inline-flex">
            <Button 
              variant={activeTab === "gallery" ? "default" : "ghost"} 
              onClick={() => setActiveTab("gallery")}
              className="rounded-full text-sm px-4"
              size="sm"
            >
              All Submissions
            </Button>
            <Button 
              variant={activeTab === "top" ? "default" : "ghost"} 
              onClick={() => setActiveTab("top")}
              className="rounded-full text-sm px-4"
              size="sm"
            >
              Top Rated
            </Button>
          </div>
        </div>
        
        {activeTab === "create" && !isBattleClosed && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <MemeGenerator 
                templates={[]} 
                challengeId={Number(id)} 
                challengePrompt={challenge.title} 
                isBattle={true}
              />
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="top">Top Rated</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoadingMemes ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : memeData.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>No Submissions Yet</CardTitle>
                  <CardDescription>Be the first to submit a meme for this battle!</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button 
                    onClick={() => setActiveTab("create")}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Meme
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memeData.map((meme, index) => (
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
                                  onClick={() => voteMutation.mutate(meme.id)}
                                  disabled={voteMutation.isPending}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="top">
            {memeData.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>No Top Memes Yet</CardTitle>
                  <CardDescription>Be the first to submit and get votes!</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button onClick={() => setActiveTab("create")} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus size={16} className="mr-2" />
                    Create Meme
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...memeData].sort((a, b) => b.likes - a.likes).slice(0, 10).map((meme, index) => (
                  <Card key={meme.id} className={`overflow-hidden ${index === 0 ? 'ring-2 ring-amber-500' : ''}`}>
                    <div className="h-64 overflow-hidden relative">
                      {index === 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-amber-500">Top Rated</Badge>
                        </div>
                      )}
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:bg-primary/10" 
                            onClick={() => voteMutation.mutate(meme.id)}
                          >
                            <ThumbsUp size={16} />
                          </Button>
                          <span className="font-medium">{meme.likes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <MemeLeaderboard 
              memes={memeData} 
              isEnded={challenge ? new Date() > new Date(challenge.endDate) : false}
            />
          </TabsContent>
        </Tabs>
        
        {selectedMeme && (
          <MemeDetailsModal 
            memeId={selectedMeme} 
            onClose={() => setSelectedMeme(null)} 
            challengeId={Number(id)}
          />
        )}
      </div>
    </>
  );
}