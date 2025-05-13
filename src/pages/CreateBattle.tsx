import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface BattleFormData {
  promptText: string;
  theme?: string;
  description?: string;
  tags: string;
  duration: string;
}

const CreateBattle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BattleFormData>({
    defaultValues: {
      promptText: '',
      theme: '',
      description: '',
      tags: '',
      duration: '24'
    }
  });
  
  const onSubmit = async (data: BattleFormData) => {
    if (!user) {
      toast.error('You need to be logged in to create battles');
      navigate('/login', { state: { returnPath: '/create-battle' } });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Parse tags
      const parsedTags = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Parse duration
      const durationHours = parseInt(data.duration, 10);
      
      // Calculate end time
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + (durationHours * 60 * 60 * 1000)); // hours to milliseconds
      
      // First create a prompt
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .insert({
          text: data.promptText,
          theme: data.theme || null,
          description: data.description || null,
          tags: parsedTags,
          active: true,
          is_community: true,
          creator_id: user.id,
          start_date: startTime.toISOString(),
          end_date: endTime.toISOString(),
        })
        .select()
        .single();
      
      if (promptError) {
        throw new Error(`Error creating prompt: ${promptError.message}`);
      }
      
      // For a new battle, we need placeholder meme IDs since they're required
      // We'll use the same placeholder for both, and they'll be updated later
      // when users submit memes and vote on them
      const placeholderId = '00000000-0000-0000-0000-000000000000';
      
      // Then create an empty battle with placeholder meme IDs
      const { data: battleData, error: battleError } = await supabase
        .from('battles')
        .insert({
          prompt_id: promptData.id,
          is_community: true,
          creator_id: user.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          meme_one_id: placeholderId,
          meme_two_id: placeholderId
        })
        .select()
        .single();
      
      if (battleError) {
        throw new Error(`Error creating battle: ${battleError.message}`);
      }
      
      toast.success('Battle created successfully!', {
        description: 'Now others can submit memes for your battle.'
      });
      
      navigate('/battles');
      
    } catch (error) {
      console.error('Error creating battle:', error);
      toast.error('Failed to create battle', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading mb-6">Create a Meme Battle</h1>
          
          {!user ? (
            <Card>
              <CardHeader>
                <CardTitle>Sign in required</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You need to be logged in to create a battle.</p>
                <Button className="mt-4" onClick={() => navigate('/login', { state: { returnPath: '/create-battle' } })}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Battle Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="promptText">Challenge Prompt *</Label>
                    <Textarea 
                      id="promptText"
                      placeholder="Enter a challenge prompt for the battle (e.g. 'Most awkward moment in a job interview')"
                      {...register("promptText", { required: true })}
                      className={errors.promptText ? "border-destructive" : ""}
                    />
                    {errors.promptText && <p className="text-destructive text-sm mt-1">Prompt is required</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="theme">Theme (Optional)</Label>
                    <Input 
                      id="theme"
                      placeholder="Theme for this battle"
                      {...register("theme")}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description"
                      placeholder="Additional details or context for the battle"
                      {...register("description")}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (Comma separated)</Label>
                    <Input 
                      id="tags"
                      placeholder="funny, challenge, interview"
                      {...register("tags")}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Battle Duration</Label>
                    <Select 
                      defaultValue="24"
                      onValueChange={(value) => setValue("duration", value)}
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">2 days</SelectItem>
                        <SelectItem value="72">3 days</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" disabled={isCreating} className="w-full">
                      {isCreating ? 'Creating Battle...' : 'Create Battle'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateBattle;
