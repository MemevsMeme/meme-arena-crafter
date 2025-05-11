import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateChallengeId } from '@/lib/dailyChallenges';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TagsInput } from '@/components/ui/tags-input';

// Form schema for battle creation
const battleSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  tags: z.array(z.string()).min(1, { message: "Add at least one tag" }),
});

const CreateBattle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof battleSchema>>({
    resolver: zodResolver(battleSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof battleSchema>) => {
    if (!user) {
      toast.error("You must be logged in to create a battle");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a new prompt
      const newPrompt = {
        id: generateChallengeId(),
        text: values.title,
        theme: '',
        tags: values.tags,
        active: true,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
        description: values.description,
        creator_id: user.id,
        is_community: true
      };
      
      // Insert into database
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .insert({
          text: values.title,
          theme: '',
          tags: values.tags,
          active: true,
          start_date: new Date().toISOString(),
          end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          description: values.description,
          creator_id: user.id,
          is_community: true
        })
        .select()
        .single();
      
      if (promptError) {
        throw new Error(promptError.message);
      }
      
      toast.success("Battle created successfully!");
      navigate(`/battles`);
    } catch (error) {
      console.error("Error creating battle:", error);
      toast.error("Failed to create battle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-heading mb-6">Create a New Battle</h1>
          
          <div className="bg-background rounded-lg border p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Battle Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a catchy title for your battle" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be the prompt that others will create memes for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide some context or guidelines for the battle" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <TagsInput 
                          placeholder="Add tags and press enter" 
                          tags={field.value} 
                          setTags={field.onChange} 
                        />
                      </FormControl>
                      <FormDescription>
                        Add relevant tags to help others find your battle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-purple hover:bg-brand-purple/90"
                  >
                    {isSubmitting ? "Creating..." : "Create Battle"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateBattle;
