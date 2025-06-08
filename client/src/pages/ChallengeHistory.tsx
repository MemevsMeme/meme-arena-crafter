import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DailyChallenge } from "@shared/schema";
import { Calendar, Filter, Search, ArrowLeft } from "lucide-react";

type SortOption = "recent" | "oldest" | "popular";
type FilterOption = "all" | "active" | "ended";

export default function ChallengeHistory() {
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");

  // Fetch all daily challenges
  const { data: challenges, isLoading } = useQuery<DailyChallenge[]>({
    queryKey: ['/api/daily-challenges'],
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/daily-challenge")}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold ml-2">Challenge History</h1>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-full md:w-48" />
            <Skeleton className="h-10 w-full md:w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter and sort challenges
  const filteredChallenges = challenges
    ? challenges.filter((challenge) => {
        // Filter by status
        if (filterOption === "active") {
          const now = new Date();
          const endDate = new Date(challenge.endDate);
          if (endDate < now || !challenge.isActive) return false;
        } else if (filterOption === "ended") {
          const now = new Date();
          const endDate = new Date(challenge.endDate);
          if (endDate >= now && challenge.isActive) return false;
        }

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            challenge.promptText.toLowerCase().includes(query) ||
            challenge.category.toLowerCase().includes(query) ||
            challenge.promptId.toLowerCase().includes(query)
          );
        }

        return true;
      })
    : [];

  // Sort challenges
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (sortOption === "recent") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortOption === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      // For "popular" sort, we'd ideally sort by participation count
      // But we don't have that info in the challenge list, so fall back to date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // Calculate challenge status and time remaining
  const getChallengeStatus = (challenge: DailyChallenge) => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    
    if (endDate < now || !challenge.isActive) {
      return { status: "ended", label: "Ended", color: "bg-slate-500" };
    }
    
    const diff = Math.floor((endDate.getTime() - now.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    return {
      status: "active",
      label: `${hours}h ${minutes}m remaining`,
      color: "bg-green-500"
    };
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/daily-challenge")}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold ml-2">Challenge History</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search challenges..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={filterOption} onValueChange={(value) => setFilterOption(value as FilterOption)}>
              <SelectTrigger>
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Challenges</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="ended">Ended Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {sortedChallenges.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No Challenges Found</h2>
          <p className="text-gray-500 mb-6">
            No challenges match your current filters. Try adjusting your search or filters.
          </p>
          <Button onClick={() => {
            setSearchQuery("");
            setFilterOption("all");
            setSortOption("recent");
          }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChallenges.map((challenge) => {
            const status = getChallengeStatus(challenge);
            return (
              <Card 
                key={challenge.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/daily-challenge/${challenge.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{challenge.promptText}</CardTitle>
                    <Badge className={`${status.color} text-white`}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Calendar size={14} />
                    <span className="text-sm">
                      {new Date(challenge.date).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="outline">{challenge.category}</Badge>
                </CardContent>
                
                <CardFooter className="pt-0 flex justify-between">
                  <span className="text-xs text-muted-foreground">Challenge #{challenge.promptId}</span>
                  <div className="flex -space-x-2">
                    {/* Placeholder avatars for participants */}
                    {[1, 2, 3].map((i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${challenge.id}-${i}`} />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}