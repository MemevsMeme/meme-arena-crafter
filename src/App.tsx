
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Create from "./pages/Create";
import Battle from "./pages/Battle";
import Battles from "./pages/Battles";
import CreateBattle from "./pages/CreateBattle";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          {/* Only use Sonner toast - remove references to other toast systems */}
          <Toaster position="top-right" closeButton richColors />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<Create />} />
            <Route path="/battle/:id" element={<Battle />} />
            <Route path="/battles" element={<Battles />} />
            <Route path="/create-battle" element={<CreateBattle />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
