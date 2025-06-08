import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import UserAchievements from "@/components/UserAchievements";
import AchievementShowcase from "@/components/AchievementShowcase";
import { Trophy, Award, Medal, TrendingUp, Laugh, Heart, Users } from "lucide-react";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [avatarStyle, setAvatarStyle] = useState("avataaars");
  const [avatarBackground, setAvatarBackground] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatarUrl(user.profileImageUrl || "");
      setAvatarSeed(user.avatarSeed || "");
      setAvatarStyle(user.avatarStyle || "avataaars");
      setAvatarBackground(user.avatarBackgroundColor || "");
    }
  }, [user]);

  const generateRandomAvatar = async () => {
    try {
      const response = await fetch("/api/auth/generate-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          style: avatarStyle,
          backgroundColor: avatarBackground
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatarUrl);
        setAvatarSeed(data.seed);
      }
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast({
        title: "Error",
        description: "Failed to generate avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    if (!username.trim()) {
      toast({
        title: "Invalid username",
        description: "Username cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          avatarSeed,
          avatarStyle,
          avatarBackgroundColor: avatarBackground
        }),
      });

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        // Refresh the avatar
        const newAvatarUrl = generateAvatar(avatarSeed, avatarStyle, avatarBackground);
        setAvatarUrl(newAvatarUrl);
        // Redirect to home after successful update
        setTimeout(() => setLocation("/"), 1500);
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Helper function to generate avatar URL
  const generateAvatar = (seed: string, style: string = 'avataaars', backgroundColor?: string): string => {
    let url = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
    
    if (backgroundColor) {
      if (backgroundColor.startsWith('gradient-')) {
        // For gradients, we need to use the gradientColors parameter
        const gradientColors = 
          backgroundColor === 'gradient-blue' ? ['a0c4ff', '3f83f8'] :
          backgroundColor === 'gradient-pink' ? ['fda4af', 'e11d48'] : 
          backgroundColor === 'gradient-purple' ? ['c084fc', '8b5cf6'] : 
          backgroundColor === 'gradient-orange' ? ['fdba74', 'f97316'] : 
          ['a8a8a8', 'e4e4e4']; // Default fallback
          
        url += `&backgroundType=gradientLinear&backgroundColor=${encodeURIComponent(gradientColors[1])}&backgroundRotation=135&gradientColors[]=${encodeURIComponent(gradientColors[0])}&gradientColors[]=${encodeURIComponent(gradientColors[1])}`;
      } else {
        // For solid colors
        url += `&backgroundColor=${encodeURIComponent(backgroundColor)}`;
      }
    }
    
    return url;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in to view your profile.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.href = "/api/login"}>
              Log in
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Fetch user's memes
  const [userMemes, setUserMemes] = useState<any[]>([]);
  const [isLoadingMemes, setIsLoadingMemes] = useState(false);
  
  // Get user stats
  const fetchUserMemes = async () => {
    if (!user) return;
    
    try {
      setIsLoadingMemes(true);
      const response = await fetch(`/api/memes/user/${user.id}`);
      
      if (response.ok) {
        const memes = await response.json();
        setUserMemes(memes);
      }
    } catch (error) {
      console.error("Error fetching user memes:", error);
    } finally {
      setIsLoadingMemes(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchUserMemes();
    }
  }, [user]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Editor Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Update your profile information and avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback>{username?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                
                <div className="w-full space-y-4">
                  {/* Avatar Style Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="avatar-style">Avatar Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['avataaars', 'bottts', 'pixel-art', 'identicon', 'initials', 'thumbs', 'lorelei', 'micah', 'notionists', 'open-peeps', 'personas', 'shapes'].map(style => (
                        <Button
                          key={style}
                          type="button"
                          variant={avatarStyle === style ? "default" : "outline"}
                          className="text-xs py-1 h-auto capitalize"
                          onClick={() => {
                            setAvatarStyle(style);
                            setAvatarUrl(generateAvatar(avatarSeed || username, style, avatarBackground));
                          }}
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Background Color Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['', 'gradient-blue', 'gradient-pink', 'gradient-purple', 'gradient-orange', 'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc'].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`w-full h-8 rounded-md border-2 ${avatarBackground === color ? 'ring-2 ring-primary' : ''}`}
                          style={{
                            background: color.startsWith('gradient') 
                              ? `linear-gradient(to right, ${color === 'gradient-blue' ? '#a0c4ff, #3f83f8' : 
                                  color === 'gradient-pink' ? '#fda4af, #e11d48' : 
                                  color === 'gradient-purple' ? '#c084fc, #8b5cf6' : 
                                  color === 'gradient-orange' ? '#fdba74, #f97316' : ''})` 
                              : color ? `#${color}` : '#f3f4f6'
                          }}
                          onClick={() => {
                            setAvatarBackground(color);
                            setAvatarUrl(generateAvatar(avatarSeed || username, avatarStyle, color));
                          }}
                          aria-label={`Background color ${color || 'none'}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={generateRandomAvatar}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Generate Random Avatar
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setLocation("/")}>
                Cancel
              </Button>
              <Button 
                onClick={updateProfile} 
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Profile Stats & Achievements */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="stats" className="mb-8">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="stats" className="flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center justify-center">
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="memes" className="flex items-center justify-center">
                <Laugh className="h-4 w-4 mr-2" />
                Memes
              </TabsTrigger>
            </TabsList>
            
            {/* Stats Tab */}
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                  <CardDescription>Your meme creation and battle performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{userMemes.length}</p>
                      <p className="text-sm text-muted-foreground">Memes Created</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{userMemes.reduce((sum, meme) => sum + (meme.likes || 0), 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Likes</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{userMemes.reduce((sum, meme) => sum + (meme.views || 0), 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{userMemes.filter(meme => (meme.rank || 0) > 0).length}</p>
                      <p className="text-sm text-muted-foreground">Ranked Memes</p>
                    </div>
                  </div>
                  
                  {/* Win Rate and Rankings */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Win Rate</span>
                        <span className="text-sm">
                          {userMemes.filter(meme => (meme.battlesWon || 0) > 0).length} / {userMemes.filter(meme => (meme.battlesTotal || 0) > 0).length}
                        </span>
                      </div>
                      <Progress 
                        value={userMemes.length > 0 ? 
                          (userMemes.filter(meme => (meme.battlesWon || 0) > 0).length / 
                          Math.max(1, userMemes.filter(meme => (meme.battlesTotal || 0) > 0).length)) * 100 : 0
                        } 
                        className="h-2"
                        aria-label="Win rate progress"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Daily Challenge Participation</span>
                        <span className="text-sm">
                          {userMemes.filter(meme => meme.dailyChallengeId).length} challenges
                        </span>
                      </div>
                      <Progress 
                        value={userMemes.filter(meme => meme.dailyChallengeId).length > 0 ? 100 : 0} 
                        className="h-2"
                        aria-label="Daily challenge participation"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Achievements Tab */}
            <TabsContent value="achievements">
              {user && <UserAchievements userId={user.id} />}
            </TabsContent>
            
            {/* Memes Tab */}
            <TabsContent value="memes">
              <Card>
                <CardHeader>
                  <CardTitle>Your Memes</CardTitle>
                  <CardDescription>All the memes you've created</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingMemes ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : userMemes.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">You haven't created any memes yet</p>
                      <Button onClick={() => setLocation("/create")}>Create Your First Meme</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {userMemes.map((meme) => (
                        <div 
                          key={meme.id} 
                          className="overflow-hidden rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setLocation(`/meme/${meme.id}`)}
                        >
                          <div className="aspect-square relative">
                            <img 
                              src={meme.imageUrl} 
                              alt={meme.promptText} 
                              className="object-cover w-full h-full"
                            />
                            {meme.rank === 1 && (
                              <div className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded-full">
                                <Trophy size={16} />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-sm truncate">{meme.promptText}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" /> {meme.likes || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" /> {meme.views || 0}
                                </span>
                              </div>
                              <span>{new Date(meme.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;