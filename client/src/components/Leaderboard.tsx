import { useState } from "react";
import { cn, formatNumber, getWinRate } from "@/lib/utils";
import { MemeWithStats } from "@shared/schema";

type TimeRange = "day" | "week" | "month" | "all";

interface LeaderboardProps {
  memes: MemeWithStats[];
  isLoading: boolean;
}

const Leaderboard = ({ memes, isLoading }: LeaderboardProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium">Top Memes</h3>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {timeRange === "day" && "Last 24 hours"}
            {timeRange === "week" && "Last 7 days"}
            {timeRange === "month" && "Last 30 days"}
            {timeRange === "all" && "All time"}
          </span>
        </div>
        <div className="flex space-x-2">
          <TimeRangeButton
            label="Day"
            isActive={timeRange === "day"}
            onClick={() => handleTimeRangeChange("day")}
          />
          <TimeRangeButton
            label="Week"
            isActive={timeRange === "week"}
            onClick={() => handleTimeRangeChange("week")}
          />
          <TimeRangeButton
            label="Month"
            isActive={timeRange === "month"}
            onClick={() => handleTimeRangeChange("month")}
          />
          <TimeRangeButton
            label="All Time"
            isActive={timeRange === "all"}
            onClick={() => handleTimeRangeChange("all")}
          />
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
          <tr>
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Meme</th>
            <th className="py-3 px-4">Creator</th>
            <th className="py-3 px-4">Votes</th>
            <th className="py-3 px-4">Win Rate</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                Loading leaderboard data...
              </td>
            </tr>
          ) : memes.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No memes found in the leaderboard yet.
              </td>
            </tr>
          ) : (
            memes.map((meme, index) => (
              <tr key={meme.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-4 px-4">
                  <span className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold",
                    index === 0 
                      ? "bg-gradient-to-br from-primary to-secondary text-white" 
                      : "bg-gray-200 text-gray-700"
                  )}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center">
                    <img 
                      src={meme.imageUrl} 
                      alt={meme.promptText}
                      className="w-12 h-12 rounded-lg object-cover mr-3" 
                    />
                    <div>
                      <p className="font-medium text-sm">"{meme.promptText}"</p>
                      <p className="text-xs text-gray-500">Meme #{meme.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <i className="ri-user-line text-gray-600"></i>
                    </div>
                    <span>user_{meme.userId || "anonymous"}</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-medium">{formatNumber(meme.likes)}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${meme.winRate || 0}%` }}
                      ></div>
                    </div>
                    <span>{meme.winRate || 0}%</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <button className="text-gray-500 hover:text-primary transition mr-2">
                    <i className="ri-share-line"></i>
                  </button>
                  <button className="text-gray-500 hover:text-primary transition">
                    <i className="ri-heart-line"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">
            Showing {memes.length} of {memes.length} memes
          </span>
        </div>
        <div className="flex space-x-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50" disabled>
            <i className="ri-arrow-left-s-line"></i>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-primary text-white">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition disabled:opacity-50" disabled>
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

interface TimeRangeButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TimeRangeButton = ({ label, isActive, onClick }: TimeRangeButtonProps) => {
  return (
    <button
      className={cn(
        "px-3 py-1 rounded-lg text-sm transition",
        isActive ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Leaderboard;
