
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Battle as BattleType } from '@/lib/types';
import { getBattleById } from '@/lib/database';
import { getPromptById } from '@/lib/databaseAdapter';
import { castVote } from '@/lib/database/votes';
import BattleView from '@/components/battle/BattleView';

const Battle = () => {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [battle, setBattle] = useState<BattleType | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBattleData = async () => {
      if (!battleId) return;
      
      try {
        setLoading(true);
        
        // Fetch battle data
        const battleData = await getBattleById(battleId);
        if (!battleData) {
          toast.error('Battle not found');
          navigate('/battles');
          return;
        }
        
        setBattle(battleData);
        
        // Get prompt if needed
        if (battleData.promptId && !battleData.prompt) {
          try {
            const promptData = await getPromptById(battleData.promptId);
            if (promptData) {
              setBattle(prev => prev ? {
                ...prev,
                prompt: promptData.text
              } : null);
            }
          } catch (error) {
            console.error('Error fetching prompt:', error);
            // Continue even if prompt fetch fails
          }
        }
      } catch (error) {
        console.error('Error fetching battle data:', error);
        toast.error('Failed to load battle data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBattleData();
  }, [battleId, navigate]);
  
  const handleVote = async (memeId: string) => {
    if (!user || !battleId) return;
    
    try {
      const success = await castVote(user.id, battleId, memeId);
      
      if (success) {
        toast.success('Vote cast successfully!');
        
        // Update the battle data
        const updatedBattle = await getBattleById(battleId);
        if (updatedBattle) {
          setBattle(updatedBattle);
        }
      } else {
        toast.error('Failed to cast vote');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('An error occurred while voting');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading battle...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!battle) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Battle not found</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <BattleView 
          battle={battle} 
          onVote={handleVote} 
          isLoggedIn={!!user} 
          userId={user?.id} 
          onBackClick={() => navigate('/battles')}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Battle;
