import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import MemeGenerator from "@/components/MemeGenerator";
import { Template, DailyChallenge } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";

const Create = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [location, setLocation] = useLocation();
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [promptFromUrl, setPromptFromUrl] = useState<string | null>(null);
  
  // Get templates for the meme generator
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });
  
  // Get challenge info if creating for a challenge
  const { data: challenge, isLoading: isLoadingChallenge } = useQuery<DailyChallenge>({
    queryKey: ['/api/daily-challenges', challengeId],
    enabled: !!challengeId,
  });
  
  // Check for challenge ID and prompt in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const challengeParam = urlParams.get('challenge');
    const promptParam = urlParams.get('prompt');
    
    if (challengeParam) {
      setChallengeId(parseInt(challengeParam));
    }
    
    if (promptParam) {
      setPromptFromUrl(decodeURIComponent(promptParam));
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-8">
          {challenge ? (
            // For challenge submissions
            <>
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" onClick={() => setLocation(`/daily-challenge/${challengeId}`)}>
                  <ArrowLeft size={20} />
                </Button>
                <div className="ml-2">
                  <h2 className="text-3xl font-heading font-bold">Create for Challenge</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-indigo-100 text-indigo-800">{challenge.category}</Badge>
                    <span className="flex items-center text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {challenge.date ? new Date(challenge.date).toLocaleDateString() : "Today"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xl font-medium mb-4">"{challenge.promptText}"</p>
            </>
          ) : (
            // For regular meme creation
            <h2 className="text-3xl font-heading font-bold mb-2">Create a Meme</h2>
          )}
          <p className="text-gray-600">
            Express yourself with AI-generated memes, classic templates, or your own uploaded images
          </p>
        </div>
        
        <MemeGenerator 
          templates={templates} 
          challengeId={challengeId}
          challengePrompt={promptFromUrl || challenge?.promptText}
        />
      </main>
    </div>
  );
};

export default Create;