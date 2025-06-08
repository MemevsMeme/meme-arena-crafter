import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Types
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Generate a random avatar for registration
  const generateRandomAvatar = async () => {
    try {
      const response = await fetch("/api/auth/generate-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatarUrl);
        setAvatarSeed(data.seed);
      }
    } catch (error) {
      console.error("Error generating avatar:", error);
    }
  };

  // Generate avatar on first load
  useState(() => {
    generateRandomAvatar();
  });

  // Handle login submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/");
      } else {
        const error = await response.json();
        toast({
          title: "Login failed",
          description: error.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Add avatar data to registration
      const registrationData = {
        ...values,
        avatarSeed,
        profileImageUrl: avatarUrl,
      };
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Your account has been created!",
        });
        navigate("/");
      } else {
        const error = await response.json();
        toast({
          title: "Registration failed",
          description: error.message || "Registration failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="flex w-full max-w-5xl">
        {/* Left Column - Auth Forms */}
        <div className="w-full md:w-1/2 p-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Meme Vs Meme</CardTitle>
              <CardDescription>
                Login or create an account to start creating and sharing memes!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form 
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
                      className="space-y-4 pt-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form 
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)} 
                      className="space-y-4 pt-4"
                    >
                      <div className="flex justify-center mb-4">
                        <div className="text-center">
                          <Avatar className="w-24 h-24 mx-auto mb-2">
                            <AvatarImage src={avatarUrl} alt="Avatar" />
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={generateRandomAvatar}
                          >
                            Randomize Avatar
                          </Button>
                        </div>
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-muted-foreground text-center">
                By continuing, you agree to our terms of service and privacy policy.
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Column - Hero Section */}
        <div className="hidden md:block md:w-1/2 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
          <div className="h-full flex flex-col justify-center items-center text-center p-6">
            <h1 className="text-4xl font-bold mb-4">Create, Battle, Win!</h1>
            <p className="text-xl mb-6">
              Join the ultimate meme arena where your creativity battles for supremacy.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-background p-4 rounded-lg shadow-md">
                <h3 className="font-bold mb-2">AI-Powered</h3>
                <p className="text-sm">Generate unique memes with cutting-edge AI technology</p>
              </div>
              <div className="bg-background p-4 rounded-lg shadow-md">
                <h3 className="font-bold mb-2">Compete</h3>
                <p className="text-sm">Battle your memes against others and climb the leaderboard</p>
              </div>
              <div className="bg-background p-4 rounded-lg shadow-md">
                <h3 className="font-bold mb-2">Customize</h3>
                <p className="text-sm">Edit and personalize your memes with our advanced tools</p>
              </div>
              <div className="bg-background p-4 rounded-lg shadow-md">
                <h3 className="font-bold mb-2">Share</h3>
                <p className="text-sm">Share your creations with friends and the community</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}