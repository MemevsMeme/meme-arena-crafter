
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/ui/UserAvatar';
import { ArrowLeft, Share, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Battle as BattleType, Meme as MemeType, Vote } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { getBattleById, getPromptById, castVote } from '@/lib/database';
import MemeCard from '@/components/meme/MemeCard';
import BattleCard from '@/components/battle/BattleCard';

const Battle = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch battle details
  const { data: battle, isLoading: isBattleLoading, error: battleError } = useQuery({
    queryKey: ['battle', id],
    queryFn: () => getBattleById(id!),
    enabled: !!id,
  });

  // Fetch prompt details if battle has a prompt ID
  const { data: prompt, isLoading: isPromptLoading, error: promptError } = useQuery({
    queryKey: ['prompt', battle?.promptId],
    queryFn: () => getPromptById(battle?.promptId!),
    enabled: !!battle?.promptId,
  });

  const { mutate: handleVote, isPending: isVoting } = useMutation({
    mutationFn: async (memeId: string) => {
      if (!user) {
        throw new Error("You must be logged in to vote.");
      }
      if (!battle) {
        throw new Error("Battle not loaded.");
      }
      return await castVote(battle.id, memeId, user.id);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vote cast successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['battle', id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cast vote.",
        variant: "destructive"
      });
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `MemeVsMeme Battle`,
        text: `Check out this MemeVsMeme battle!`,
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.error('Error sharing', error));
    } else {
      toast({
        title: "Info",
        description: "Web Share API not supported. Copy the link to share."
      });
    }
  };

  if (isBattleLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="text-center">
            <p>Loading battle...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (battleError || !battle) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="text-center">
            <p>Error loading battle.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meme One */}
          <div className="relative">
            {battle.memeOne && (
              <>
                <MemeCard meme={battle.memeOne} />
                <Button
                  onClick={() => handleVote(battle.memeOneId)}
                  disabled={isVoting}
                  className="absolute bottom-4 right-4 bg-white text-brand-purple hover:bg-white/90"
                >
                  Vote Meme 1
                </Button>
              </>
            )}
          </div>

          {/* Meme Two */}
          <div className="relative">
            {battle.memeTwo && (
              <>
                <MemeCard meme={battle.memeTwo} />
                <Button
                  onClick={() => handleVote(battle.memeTwoId)}
                  disabled={isVoting}
                  className="absolute bottom-4 right-4 bg-white text-brand-purple hover:bg-white/90"
                >
                  Vote Meme 2
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Battle;
