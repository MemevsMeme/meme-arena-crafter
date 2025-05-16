
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Create from './pages/Create';
import Profile from './pages/Profile';
import Battle from './pages/Battle';
import Battles from './pages/Battles';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './contexts/QueryContext';

// Add imports for all pages including Leaderboard
import ImportChallenges from './pages/admin/ImportChallenges';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<Create />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/battle/:battleId" element={<Battle />} />
            <Route path="/battles" element={<Battles />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            {/* Admin routes */}
            <Route path="/admin/import-challenges" element={<ImportChallenges />} />
            
            {/* The NotFound route should remain last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
