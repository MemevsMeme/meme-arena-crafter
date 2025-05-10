
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeCard from '@/components/meme/MemeCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MOCK_USERS, MOCK_MEMES } from '@/lib/constants';
import { Award, Bell, Edit, Heart, MessageSquare, Share, Star, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [isFollowing, setIsFollowing] = React.useState(false);
  
  // For MVP, we'll use mock data
  const user = MOCK_USERS.find(u => u.id === id) || MOCK_USERS[0];
  const userMemes = MOCK_MEMES.filter(m => m.creatorId === user.id);
  
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    
    if (!isFollowing) {
      toast.success('Following ' + user.username, {
        description: "You'll see their memes in your feed now.",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background border rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left mb-4">
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "" : "bg-brand-purple"}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
                
                <div className="flex justify-center gap-2">
                  <Button variant="ghost" size="icon" title="Send message">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Share profile">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-heading">{user.username}</h1>
                  <div>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Bell className="h-4 w-4" />
                      Notify
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 my-3">
                  <span className="bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <Star className="h-3 w-3" /> Level {user.level}
                  </span>
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold">{user.memeStreak}</p>
                    <p className="text-xs text-brand-orange">days</p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Record</p>
                    <p className="text-2xl font-bold">{user.wins} - {user.losses}</p>
                    <p className="text-xs text-brand-orange">W - L</p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">XP</p>
                    <p className="text-2xl font-bold">{user.xp}</p>
                    <Progress value={((user.xp % 100) / 100) * 100} className="h-1.5 mt-1.5" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-brand-orange" />
                    <h3 className="font-medium">Achievements</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-muted rounded-full px-3 py-1 text-xs flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-brand-purple" />
                      Trending Creator
                    </div>
                    <div className="bg-muted rounded-full px-3 py-1 text-xs flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      100+ Likes
                    </div>
                    <div className="bg-muted rounded-full px-3 py-1 text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      Featured Memer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="memes">
            <TabsList className="w-full">
              <TabsTrigger value="memes" className="flex-1">Memes</TabsTrigger>
              <TabsTrigger value="battles" className="flex-1">Battles</TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="memes" className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userMemes.length > 0 ? (
                  userMemes.map(meme => (
                    <MemeCard key={meme.id} meme={meme} />
                  ))
                ) : (
                  <div className="col-span-full text-center p-10 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No memes created yet.</p>
                    <Link to="/create" className="mt-3 inline-block">
                      <Button>Create First Meme</Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="battles" className="py-6">
              <div className="text-center p-10 bg-muted rounded-lg">
                <p className="text-muted-foreground">Battle history will appear here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="py-6">
              <div className="text-center p-10 bg-muted rounded-lg">
                <p className="text-muted-foreground">User statistics will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
