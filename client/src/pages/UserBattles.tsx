import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Users, Plus, Swords, ArrowRight, CalendarIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { DailyChallenge } from "@shared/schema";
import { useLocation } from "wouter";

// Battle creation schema
const battleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Please select a category"),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date({
    required_error: "Please select an end date",
  }),
  maxSubmissions: z.number().min(5).max(100).default(50),
  style: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// Define categories
const categories = [
  "Funny", "Pop Culture", "Movies", "Politics", "Animals", 
  "Technology", "Sports", "Gaming", "Music", "Food",
  "Wholesome", "Sci-Fi", "Fantasy", "Absurd", "Educational", "Other"
];

// Available AI image styles
const aiStyles = [
  { id: "cartoon", name: "Cartoon", description: "Colorful, fun cartoon style" },
  { id: "realistic", name: "Realistic", description: "Photorealistic imagery" },
  { id: "artistic", name: "Artistic", description: "Creative artistic interpretation" },
  { id: "minimalist", name: "Minimalist", description: "Clean, simple designs" },
  { id: "surreal", name: "Surreal", description: "Dream-like, fantastical imagery" },
  { id: "anime", name: "Anime", description: "Japanese animation style" },
  { id: "pixel", name: "Pixel Art", description: "Retro pixel art style" },
  { id: "comic", name: "Comic Book", description: "Classic comic book aesthetics" },
];

export default function UserBattles() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [_, setLocation] = useLocation();

  // Form for creating a battle
  const form = useForm<z.infer<typeof battleSchema>>({
    resolver: zodResolver(battleSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      maxSubmissions: 50,
      visibility: "public",
      style: "",
    },
  });
  
  // Handle style selection
  const handleStyleClick = (styleId: string) => {
    if (selectedStyle === styleId) {
      setSelectedStyle(null);
      form.setValue("style", "");
    } else {
      setSelectedStyle(styleId);
      form.setValue("style", styleId);
    }
  };

  interface UserBattle {
    id: number;
    title: string;
    description: string;
    creator: string;
    participantCount: number;
    createdAt: string;
    status: string;
  }

  // Query to fetch user-created battles
  const { data: userBattlesData = [], isLoading } = useQuery<DailyChallenge[]>({
    queryKey: ['/api/user-battles'],
  });
  
  // Convert daily challenge format to battle format for display
  const battles: UserBattle[] = userBattlesData.map(challenge => ({
    id: challenge.id,
    title: challenge.title || challenge.promptText,
    description: challenge.description || challenge.promptText,
    creator: "You", // Since these are user-created
    participantCount: challenge.participantCount || 0, // Using the participant count from server
    createdAt: new Date(challenge.date).toISOString(),
    status: new Date() < new Date(challenge.endDate) ? "active" : "completed"
  }));

  // Filter active battles
  const activeBattles = battles.filter(battle => battle.status === "active");

  // Mutation to create a battle
  const createBattleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof battleSchema>) => {
      // Generate a unique timestamp ID for the battle
      const timestamp = new Date().getTime();
      const promptId = `B${timestamp.toString().slice(-6)}`;
      
      const battleData = {
        promptId,
        title: data.title,
        promptText: data.description,
        description: data.description,
        category: data.category,
        date: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        maxSubmissions: data.maxSubmissions,
        style: data.style || '',
        visibility: data.visibility,
        isActive: true,
        isUserCreated: true
      };
      
      // Use a separate endpoint for user battles
      const res = await fetch('/api/user-battles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(battleData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create battle');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate user battles queries
      queryClient.invalidateQueries({ queryKey: ['/api/user-battles'] });
      
      form.reset();
      setCreateDialogOpen(false);
      toast({
        title: "Battle created!",
        description: "Your meme battle has been created successfully.",
      });
      
      // Refresh the page to show the new battle
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Failed to create battle",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handler for submitting the form
  const onSubmit = (data: z.infer<typeof battleSchema>) => {
    createBattleMutation.mutate(data);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2 animate-slide-up">Meme Battles Arena</h1>
            <p className="text-muted-foreground animate-slide-in-right">Create or join meme battles with other users</p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0 animate-bounce-light"
            onClick={() => window.location.href = "/battles/create"}
            disabled={!user}
          >
            <Plus size={16} className="mr-2" />
            Create Battle
          </Button>
        </div>

        <Tabs defaultValue="active" className="mb-8 animate-fade-in">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Battles</TabsTrigger>
            <TabsTrigger value="yours">Your Battles</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          {/* Active battles tab */}
          <TabsContent value="active">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : activeBattles.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>No Active Battles</CardTitle>
                  <CardDescription>Be the first to create a new meme battle!</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button 
                    onClick={() => window.location.href = "/battles/create"}
                    disabled={!user}
                  >
                    <Plus size={16} className="mr-2" />
                    Create Battle
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBattles.map((battle, index) => (
                  <Card 
                    key={battle.id} 
                    className="overflow-hidden flex flex-col animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{battle.title}</CardTitle>
                        <Swords size={24} className="text-indigo-500" />
                      </div>
                      <CardDescription>Created by: {battle.creator}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm line-clamp-3">{battle.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Users size={16} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{battle.participantCount || 0} participants</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => setLocation(`/battles/${battle.id}`)}
                      >
                        View Battle
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Your battles tab */}
          <TabsContent value="yours">
            {!user ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>Log In Required</CardTitle>
                  <CardDescription>You need to log in to see your meme battles</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button onClick={() => window.location.href = "/api/login"}>
                    Log In
                  </Button>
                </CardFooter>
              </Card>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : battles.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>No Battles Yet</CardTitle>
                  <CardDescription>You haven't created any meme battles yet</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Your First Battle
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {battles.map((battle, index) => (
                  <Card 
                    key={battle.id} 
                    className="overflow-hidden flex flex-col animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{battle.title}</CardTitle>
                        <Swords size={24} className="text-indigo-500" />
                      </div>
                      <CardDescription>By you</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm line-clamp-3">{battle.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Users size={16} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{battle.participantCount || 0} participants</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        Manage Battle
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Completed battles tab */}
          <TabsContent value="completed">
            <Card className="text-center p-8">
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>History of completed battles will be available soon</CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <Button variant="outline" onClick={() => setCreateDialogOpen(true)} disabled={!user}>
                  <Plus size={16} className="mr-2" />
                  Create New Battle
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Create battle dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px] animate-scale max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Swords size={20} className="text-indigo-500" />
                Create a Meme Battle
              </DialogTitle>
              <DialogDescription>
                Create a new meme battle and invite others to participate
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Battle Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Give your battle a catchy title" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be displayed to all users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the theme or rules of your meme battle"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Give context for the battle (themes, topics, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Categorize your battle to help users find it
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the battle starts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date <= form.getValues().startDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the battle ends
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Max Submissions */}
                <FormField
                  control={form.control}
                  name="maxSubmissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Submissions: {field.value}</FormLabel>
                      <FormControl>
                        <Slider 
                          min={5} 
                          max={100} 
                          step={5}
                          value={[field.value]} 
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of meme submissions allowed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Style Selection */}
                <div className="space-y-3">
                  <FormLabel>Style Options (Optional)</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {aiStyles.map((style) => (
                      <div
                        key={style.id}
                        className={`
                          border rounded-lg p-2 cursor-pointer transition-all
                          ${selectedStyle === style.id 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'hover:border-muted-foreground/30 hover:bg-muted/50'
                          }
                        `}
                        onClick={() => handleStyleClick(style.id)}
                      >
                        <h3 className="font-medium flex items-center gap-1 text-sm">
                          {style.name} 
                          {selectedStyle === style.id && (
                            <Sparkles size={12} className="text-primary" />
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{style.description}</p>
                      </div>
                    ))}
                  </div>
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input type="hidden" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedStyle 
                      ? `Selected style: ${aiStyles.find(s => s.id === selectedStyle)?.name}` 
                      : "No specific style required (click a style above to select one)"}
                  </p>
                </div>
                
                {/* Visibility */}
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="public" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Public</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="private" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Private</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Who can see and participate in this battle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button
                    type="submit"
                    disabled={createBattleMutation.isPending || !form.formState.isValid}
                  >
                    {createBattleMutation.isPending ? "Creating..." : "Create Battle"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}