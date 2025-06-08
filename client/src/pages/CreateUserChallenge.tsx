import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Header from "@/components/Header";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays } from "date-fns";

// Challenge creation schema
const challengeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(500, "Prompt must be less than 500 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  endDate: z.date().min(new Date(), "End date must be in the future"),
  maxSubmissions: z.number().min(5, "Minimum 5 submissions allowed").max(100, "Maximum 100 submissions allowed"),
  style: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

export default function CreateUserChallenge() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Default form values
  const defaultValues: ChallengeFormValues = {
    title: "",
    prompt: "",
    category: "",
    description: "",
    endDate: addDays(new Date(), 7), // Default to 7 days from now
    maxSubmissions: 50,
    style: "",
    visibility: "public",
  };

  // Form setup
  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues,
  });

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

  // Categories for the challenge
  const categories = [
    "Funny", "Pop Culture", "Movies", "Politics", "Animals", 
    "Technology", "Sports", "Gaming", "Music", "Food",
    "Wholesome", "Sci-Fi", "Fantasy", "Absurd", "Educational"
  ];

  // Create challenge mutation
  const createMutation = useMutation({
    mutationFn: async (values: ChallengeFormValues) => {
      const response = await fetch("/api/user-battles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create challenge");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Created!",
        description: "Your challenge has been created successfully",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user-battles'] });
      
      // Redirect to battles page
      setLocation("/battles");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create challenge",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: ChallengeFormValues) => {
    // Copy over the selected style
    values.style = selectedStyle || undefined;
    
    // Create the formatted data for the server with all required fields
    const battleData = {
      // Match the expected properties for the createMutation
      title: values.title,
      prompt: values.prompt, // This is the key the server expects
      category: values.category,
      endDate: values.endDate,
      maxSubmissions: values.maxSubmissions,
      style: values.style,
      visibility: values.visibility || 'public',
      description: values.description || values.prompt,
      
      // Server-side only properties will be added by the API
      // These properties are handled on the server side:
      // promptId, date, isActive, isUserCreated
    };
    
    createMutation.mutate(battleData);
  };

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

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 animate-slide-up">Create Your Own Challenge</h1>
          <p className="text-muted-foreground animate-slide-in-right">
            Create a custom meme challenge for the community to participate in
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
              <Card className="animate-scale">
                <CardHeader>
                  <CardTitle>Challenge Details</CardTitle>
                  <CardDescription>
                    Provide the basic information about your challenge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meme Prompt</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what memes people should create" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Give clear instructions about what you want participants to create
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
                </CardContent>
              </Card>

              <Card className="animate-scale" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle>Challenge Settings</CardTitle>
                  <CardDescription>
                    Configure the parameters of your challenge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* End Date */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <DatePicker
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </div>
                        <FormDescription>
                          When will this challenge close for submissions?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </CardContent>
              </Card>

              <Card className="animate-scale" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle>Style Options</CardTitle>
                  <CardDescription>
                    Optionally specify a style for meme submissions (or leave blank for any style)
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                        <h3 className="font-medium">{style.name}</h3>
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
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/user-battles")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || !form.formState.isValid}
                >
                  {createMutation.isPending ? "Creating..." : "Create Challenge"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}