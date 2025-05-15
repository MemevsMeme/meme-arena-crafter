
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get return URL from localStorage (set by challenges or protected routes)
  const returnUrl = localStorage.getItem('returnUrl') || '/';

  // Handle navigation based on auth state from useEffect in AuthContext instead
  // This prevents race conditions in redirection flow
  React.useEffect(() => {
    if (session) {
      // Clean up returnUrl
      localStorage.removeItem('returnUrl');
      console.log('User authenticated, redirecting to:', returnUrl);
      // Delay redirect slightly to avoid race conditions
      setTimeout(() => {
        navigate(returnUrl, { replace: true });
      }, 100);
    }
  }, [session, navigate, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await signIn(email, password);

      if (error) {
        console.error('Login error:', error);
        let errorMessage = 'Invalid email or password';
        
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email before logging in';
        }
        
        toast.error(errorMessage);
      } else {
        toast.success('You have successfully logged in.');
        // Let the useEffect handle navigation
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Separator />
            
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary font-semibold hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
