import { useQuery } from "@tanstack/react-query";
import { MemeWithStats } from "@shared/schema";
import { useState, useEffect } from "react";

export function useLeaderboard() {
  const [leaderboardMemes, setLeaderboardMemes] = useState<MemeWithStats[]>([]);

  const { 
    data: leaderboardData = [],
    isLoading: isLoadingLeaderboard
  } = useQuery<MemeWithStats[]>({
    queryKey: ["/api/leaderboard"],
    onSuccess: (data) => {
      // Sort by rank and update state
      const sortedData = [...data].sort((a, b) => {
        // First by winRate
        if ((b.winRate || 0) !== (a.winRate || 0)) {
          return (b.winRate || 0) - (a.winRate || 0);
        }
        // Then by likes
        return b.likes - a.likes;
      });
      
      setLeaderboardMemes(sortedData);
    }
  });

  return {
    leaderboardMemes,
    isLoadingLeaderboard
  };
}
