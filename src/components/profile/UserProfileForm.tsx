
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserProfileForm = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [username, setUsername] = useState(userProfile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updatedProfile = await updateUserProfile({
        username,
        avatarUrl,
      });
      
      if (updatedProfile) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a new random avatar
  const generateNewAvatar = () => {
    const newAvatarUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}-${Date.now()}`;
    setAvatarUrl(newAvatarUrl);
  };
  
  if (!userProfile) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">
            Loading profile...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button type="button" variant="outline" onClick={generateNewAvatar}>
              Generate New Avatar
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Stats</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-3">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-semibold">{userProfile.level}</p>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-sm text-muted-foreground">XP</p>
                <p className="text-2xl font-semibold">{userProfile.xp}</p>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-sm text-muted-foreground">Wins</p>
                <p className="text-2xl font-semibold">{userProfile.wins}</p>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-sm text-muted-foreground">Losses</p>
                <p className="text-2xl font-semibold">{userProfile.losses}</p>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfileForm;
