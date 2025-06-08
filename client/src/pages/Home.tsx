import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BattleArena from "@/components/BattleArena";
import MemeGenerator from "@/components/MemeGenerator";
import Leaderboard from "@/components/Leaderboard";
import Gallery from "@/components/Gallery";
import { useMemes } from "@/hooks/useMemes";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Battle, Meme } from "@shared/schema";

const Home = () => {
  const [activeTab, setActiveTab] = useState("battle");
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null);
  const [memeOne, setMemeOne] = useState<Meme | null>(null);
  const [memeTwo, setMemeTwo] = useState<Meme | null>(null);
  const [isLoadingBattle, setIsLoadingBattle] = useState(true);
  
  const { 
    memes, 
    templates, 
    isLoadingMemes,
    isLoadingTemplates,
    refetchMemes
  } = useMemes();
  
  const { leaderboardMemes, isLoadingLeaderboard } = useLeaderboard();

  const fetchBattle = async () => {
    try {
      setIsLoadingBattle(true);
      const response = await fetch('/api/battles/current');
      
      if (response.ok) {
        const data = await response.json();
        setCurrentBattle(data.battle);
        setMemeOne(data.memeOne);
        setMemeTwo(data.memeTwo);
      } else {
        setCurrentBattle(null);
        setMemeOne(null);
        setMemeTwo(null);
      }
    } catch (error) {
      console.error("Error fetching battle:", error);
      setCurrentBattle(null);
      setMemeOne(null);
      setMemeTwo(null);
    } finally {
      setIsLoadingBattle(false);
    }
  };

  const loadNewBattle = async () => {
    try {
      setIsLoadingBattle(true);
      const response = await fetch('/api/battles/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentBattle(data.battle);
        setMemeOne(data.memeOne);
        setMemeTwo(data.memeTwo);
        refetchMemes();
      }
    } catch (error) {
      console.error("Error creating battle:", error);
    } finally {
      setIsLoadingBattle(false);
    }
  };

  useEffect(() => {
    fetchBattle();
  }, []);

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-6">
        {/* Battle Section */}
        <section id="battle-section" className={activeTab !== "battle" ? "hidden" : "mb-12"}>
          {isLoadingBattle ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading battle...</p>
              </div>
            </div>
          ) : !currentBattle || !memeOne || !memeTwo ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xl text-gray-600 mb-4">No active battle found</p>
              <button 
                onClick={loadNewBattle} 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
              >
                Create New Battle
              </button>
            </div>
          ) : (
            <BattleArena
              battle={currentBattle}
              memeOne={memeOne}
              memeTwo={memeTwo}
              onNewBattle={loadNewBattle}
            />
          )}

          {/* Meme Generator Section */}
          <MemeGenerator templates={templates} />
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard-section" className={activeTab !== "leaderboard" ? "hidden" : ""}>
          <h2 className="text-2xl md:text-3xl font-poppins font-bold mb-6">Meme Leaderboard</h2>
          <Leaderboard 
            memes={leaderboardMemes}
            isLoading={isLoadingLeaderboard}
          />
        </section>

        {/* Gallery Section */}
        <section id="gallery-section" className={activeTab !== "gallery" ? "hidden" : ""}>
          <h2 className="text-2xl md:text-3xl font-poppins font-bold mb-6">Your Meme Gallery</h2>
          <Gallery 
            memes={memes}
            isLoading={isLoadingMemes}
          />
        </section>
      </main>
    </>
  );
};

export default Home;
