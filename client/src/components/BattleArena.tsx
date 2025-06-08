import { useState } from "react";
import MemeCard from "./MemeCard";
import WinnerModal from "./WinnerModal";
import { Battle, Meme } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BattleArenaProps {
  battle: Battle;
  memeOne: Meme;
  memeTwo: Meme;
  onNewBattle: () => void;
}

const BattleArena = ({ battle, memeOne, memeTwo, onNewBattle }: BattleArenaProps) => {
  const [votedMemeId, setVotedMemeId] = useState<number | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winningMeme, setWinningMeme] = useState<Meme | null>(null);
  const { toast } = useToast();

  const handleVote = async (memeId: number) => {
    try {
      setVotedMemeId(memeId);
      
      const response = await apiRequest("POST", "/api/battles/vote", {
        memeId,
        battleId: battle.id,
      });
      
      const winner = memeId === memeOne.id ? memeOne : memeTwo;
      setWinningMeme(winner);
      
      setTimeout(() => {
        setShowWinnerModal(true);
      }, 1000);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/memes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/battles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      
    } catch (error) {
      toast({
        title: "Voting failed",
        description: "There was an error registering your vote. Please try again.",
        variant: "destructive",
      });
      setVotedMemeId(null);
    }
  };

  const handleNewBattle = () => {
    setVotedMemeId(null);
    setShowWinnerModal(false);
    setWinningMeme(null);
    onNewBattle();
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-poppins font-bold mb-4 md:mb-0">Meme Battle</h2>
        <div className="flex items-center space-x-3">
          <button 
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center hover:bg-gray-100 transition"
            onClick={handleNewBattle}
          >
            <i className="ri-refresh-line mr-2"></i> New Battle
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center hover:bg-gray-100 transition">
            <i className="ri-share-line mr-2"></i> Share
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <MemeCard
          meme={memeOne}
          showVoteButton
          onVote={() => handleVote(memeOne.id)}
          isVoted={votedMemeId === memeOne.id}
        />

        {/* Versus Indicator for Mobile */}
        <div className="flex justify-center items-center lg:hidden">
          <div className="bg-dark text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">VS</div>
        </div>

        {/* Versus Indicator for Desktop */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="bg-dark text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">VS</div>
        </div>

        <MemeCard
          meme={memeTwo}
          showVoteButton
          onVote={() => handleVote(memeTwo.id)}
          isVoted={votedMemeId === memeTwo.id}
        />
      </div>

      {showWinnerModal && winningMeme && (
        <WinnerModal
          meme={winningMeme}
          isOpen={showWinnerModal}
          onClose={() => setShowWinnerModal(false)}
          onNewBattle={handleNewBattle}
        />
      )}
    </>
  );
};

export default BattleArena;
