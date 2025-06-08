import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X } from "lucide-react";
import MobileMenu from "./MobileMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  name: string;
  path: string;
  icon: string;
};

const navItems: NavItem[] = [
  { name: "Create", path: "/create", icon: "ri-add-line" },
  { name: "Daily Challenge", path: "/daily-challenge", icon: "ri-calendar-event-line" },
  { name: "Battles", path: "/battles", icon: "ri-sword-line" },
  { name: "Leaderboard", path: "/leaderboard", icon: "ri-trophy-line" },
  { name: "Gallery", path: "/gallery", icon: "ri-gallery-line" }
];

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps = {}) => {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleTabClick = (tabName: string, path: string) => {
    if (setActiveTab) {
      setActiveTab(tabName);
    }
    setLocation(path);
  };

  const goToLogin = () => {
    setLocation("/auth");
  };

  const goToLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MobileMenu 
            navItems={navItems} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <Link href="/daily-challenge">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary flex items-center cursor-pointer">
              <img src="/assets/meme-vs-logo.png" alt="Meme Vs Meme Logo" className="app-logo" />
              Meme Vs Meme
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <ThemeToggle />
          
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 transition cursor-pointer">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage 
                      src={user.profileImageUrl || `https://api.dicebear.com/7.x/${user.avatarStyle || 'avataaars'}/svg?seed=${user.avatarSeed || user.username || 'user'}`} 
                      alt={user.username || "User"} 
                    />
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden md:inline">{user.username || "User"}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  <i className="ri-user-settings-line mr-2"></i>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/my-memes")}>
                  <i className="ri-image-line mr-2"></i>
                  My Memes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={goToLogout}>
                  <i className="ri-logout-box-line mr-2"></i>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button 
              onClick={goToLogin}
              className="border border-gray-300 text-dark px-3 py-2 rounded-lg text-sm md:text-base hover:bg-gray-100 transition flex items-center"
            >
              <i className="ri-user-line mr-1"></i>
              <span className="hidden md:inline">Login</span>
            </button>
          )}
        </div>
      </div>
      <nav className="container mx-auto px-4 hidden md:flex border-b overflow-x-auto dark:border-gray-800">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={cn(
              "px-4 py-3 font-medium text-base md:text-lg flex items-center whitespace-nowrap",
              (location === item.path || (activeTab && activeTab === item.name.toLowerCase()))
                ? "tab-active" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
            onClick={() => handleTabClick(item.name.toLowerCase(), item.path)}
          >
            <i className={`${item.icon} mr-2`}></i>
            {item.name}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;