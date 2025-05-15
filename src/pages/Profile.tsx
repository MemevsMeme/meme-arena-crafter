
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MemeCard from '@/components/meme/MemeCard';
import UserProfileForm from '@/components/profile/UserProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, getMemesByUserId } from '@/lib/database';
import { User, Meme } from '@/lib/types';
import UserAvatar from '@/components/ui/UserAvatar';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === id;

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      
      // If viewing own profile, use the cached user
      if (isOwnProfile && user) {
        setProfile(user);
      } else if (id) {
        const profileData = await getProfile(id);
        setProfile(profileData);
      }
      
      if (id) {
        const userMemes = await getMemesByUserId(id);
        setMemes(userMemes);
      }
      
      setLoading(false);
    };
    
    fetchProfileData();
  }, [id, isOwnProfile, user]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            {isOwnProfile ? (
              <UserProfileForm />
            ) : (
              <div className="bg-background border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <UserAvatar user={profile} size="lg" showUsername={false} linkToProfile={false} />
                  <h2 className="text-2xl font-heading">{profile.username}</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="border rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-2xl font-semibold">{profile.level}</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="text-sm text-muted-foreground">XP</p>
                    <p className="text-2xl font-semibold">{profile.xp}</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Wins</p>
                    <p className="text-2xl font-semibold">{profile.wins}</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Losses</p>
                    <p className="text-2xl font-semibold">{profile.losses}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <Tabs defaultValue="memes">
              <TabsList className="mb-6">
                <TabsTrigger value="memes">Memes</TabsTrigger>
                <TabsTrigger value="battles">Battles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="memes">
                {memes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {memes.map(meme => {
                      // Ensure meme has a valid imageUrl before passing it to MemeCard
                      if (!meme.imageUrl) {
                        console.warn('Meme missing imageUrl:', meme.id);
                        return null;
                      }
                      
                      return (
                        <MemeCard key={meme.id} meme={{
                          ...meme,
                          // Ensure imageUrl is absolute
                          imageUrl: meme.imageUrl.startsWith('data:') 
                            ? meme.imageUrl 
                            : (meme.imageUrl.startsWith('http') 
                                ? meme.imageUrl 
                                : `${window.location.origin}${meme.imageUrl.startsWith('/') ? '' : '/'}${meme.imageUrl}`)
                        }} />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-10 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No memes created yet</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="battles">
                <div className="text-center p-10 bg-muted rounded-lg">
                  <p className="text-muted-foreground">No battle history yet</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
