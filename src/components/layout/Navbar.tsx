
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, Home, Crown, Plus, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import UserAvatar from '@/components/ui/UserAvatar';

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth();
  const unreadNotifications = 3; // This will be dynamic in the future

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg">
            <img 
              src="/lovable-uploads/88a9df58-1bce-4ab2-b65e-ec70cfcc63ca.png" 
              alt="MemeVsMeme Logo" 
              className="h-8 w-8"
            />
          </div>
          <span className="text-xl font-heading hidden sm:inline-block">MemeVsMeme</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/">
            <Button variant="ghost" size="icon" aria-label="Home">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/create">
            <Button variant="default" size="sm" className="gap-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-orange">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline-block">Create</span>
            </Button>
          </Link>
          
          <Link to="/leaderboard">
            <Button variant="ghost" size="icon" aria-label="Leaderboard">
              <Crown className="h-5 w-5" />
            </Button>
          </Link>

          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Profile">
                    {userProfile ? (
                      <UserAvatar user={userProfile} size="sm" showUsername={false} linkToProfile={false} />
                    ) : (
                      <img
                        src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=default"
                        alt="Avatar"
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm" className="hidden sm:inline-flex">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
