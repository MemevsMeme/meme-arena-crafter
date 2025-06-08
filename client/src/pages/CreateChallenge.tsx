import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { CalendarIcon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";

// Define the form schema
const formSchema = z.object({
  promptText: z.string().min(5, {
    message: "Challenge prompt must be at least 5 characters.",
  }).max(200, {
    message: "Challenge prompt must not exceed 200 characters."
  }),
  title: z.string().min(3, {
    message: "Title must be at least 3 characters."
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }).optional(),
  category: z.string().min(1, {
    message: "Please select a category."
  }),
  description: z.string().max(500, {
    message: "Description must not exceed 500 characters."
  }).optional(),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  endDate: z.date({
    required_error: "Please select an end date.",
  }),
  maxSubmissions: z.number().min(5, {
    message: "Minimum 5 submissions allowed."
  }).max(100, {
    message: "Maximum 100 submissions allowed."
  }).default(50),
  style: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
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

export default function CreateChallenge() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      promptText: "",
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

  // Handle form submission
  const createChallengeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Generate a simple prompt ID (timestamp-based)
      const timestampId = new Date().getTime().toString().slice(-6);
      const promptId = `B${timestampId}`; // B for Battle
      
      const response = await apiRequest("POST", "/api/user-battles/create", {
        promptId,
        title: values.title || values.promptText.substring(0, 50),
        promptText: values.promptText,
        description: values.description,
        category: values.category,
        date: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        maxSubmissions: values.maxSubmissions,
        style: values.style,
        visibility: values.visibility,
        isActive: true,
        userId: user ? user.id : undefined,
        isUserCreated: true
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create challenge");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate user battles query
      queryClient.invalidateQueries({ queryKey: ['/api/user-battles'] });
      
      toast({
        title: "Battle created!",
        description: "Your meme battle has been created successfully.",
      });
      
      // Redirect to battles page
      setLocation("/battles");
    },
    onError: (error) => {
      toast({
        title: "Failed to create challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createChallengeMutation.mutate(values);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            You need to be logged in to create a challenge.
          </p>
          <Button onClick={() => setLocation("/auth")}>
            Go to Login
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Create a Challenge</CardTitle>
            <CardDescription>
              Create your own meme challenge for the community to participate in!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
                
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a catchy title for your challenge" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be the main title displayed to participants
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Prompt */}
                <FormField
                  control={form.control}
                  name="promptText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a creative challenge prompt..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is the prompt that users will use to create memes
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
                        Categorize your challenge to help users find it
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description (optional) */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide additional context or rules for your challenge" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Add any additional information about your challenge
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                variant={"outline"}
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
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the challenge starts.
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
                                variant={"outline"}
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
                              disabled={(date) =>
                                date <= form.getValues().startDate
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the challenge ends.
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
                          defaultValue={[field.value]} 
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of meme submissions allowed for this challenge
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Visibility */}
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Visibility</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="public" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Public - Everyone can see and participate
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="private" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Private - Only people with the link can participate
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Style Selection */}
                <div className="space-y-4">
                  <FormLabel>Style Options (Optional)</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {aiStyles.map((style) => (
                      <div
                        key={style.id}
                        className={`
                          border rounded-lg p-3 cursor-pointer transition-all
                          ${selectedStyle === style.id 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'hover:border-muted-foreground/30 hover:bg-muted/50'
                          }
                        `}
                        onClick={() => handleStyleClick(style.id)}
                      >
                        <h3 className="font-medium flex items-center gap-1">
                          {style.name} 
                          {selectedStyle === style.id && (
                            <Sparkles size={14} className="text-primary" />
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
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

                <div className="mt-6 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation("/battles")}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="px-8" 
                    disabled={createChallengeMutation.isPending}
                  >
                    {createChallengeMutation.isPending ? "Creating..." : "Create Challenge"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setLocation("/daily-challenge")}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}