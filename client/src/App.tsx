import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";
import { SoundboardProvider } from "@/components/SoundboardManager";
import Soundboard from "@/components/Soundboard";
import AchievementSoundListener from "@/components/AchievementSoundListener";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import AuthPage from "./pages/AuthPage";
import DailyChallenge from "./pages/DailyChallenge";
import ChallengeHistory from "./pages/ChallengeHistory";
import ChallengeDetail from "./pages/ChallengeDetail";
import CreateChallenge from "./pages/CreateChallenge";
import UserBattles from "./pages/UserBattles";
import CreateUserChallenge from "./pages/CreateUserChallenge";
import BattleDetail from "./pages/BattleDetail";
import LeaderboardPage from "./pages/LeaderboardPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DailyChallenge} />
      <Route path="/create" component={Create} />
      <Route path="/battles/create" component={CreateUserChallenge} />
      <Route path="/battles/:id" component={BattleDetail} />
      <Route path="/battles" component={UserBattles} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/gallery" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/daily-challenge" component={DailyChallenge} />
      <Route path="/daily-challenge/history" component={ChallengeHistory} />
      <Route path="/daily-challenge/:id" component={ChallengeDetail} />
      <Route path="/daily-challenge/create" component={CreateChallenge} />
      <Route path="/user-battles" component={UserBattles} />
      <Route path="/user-battles/create" component={CreateUserChallenge} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SoundboardProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
            <Soundboard />
            <AchievementSoundListener />
          </TooltipProvider>
        </SoundboardProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
