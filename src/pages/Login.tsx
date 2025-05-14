
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Extract return path from location state if it exists
  const locationState = location.state as { returnTo?: string; promptData?: any } | undefined;
  const returnPath = locationState?.returnTo || '/';
  const promptData = locationState?.promptData;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to:', returnPath);
      // Pass along any prompt data that came with the redirect
      navigate(returnPath, { state: promptData });
    }
  }, [user, navigate, returnPath, promptData]);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Starting login process');
      const result = await signIn(email, password);
      
      if (result.error) {
        console.error('Login error:', result.error);
        
        // Improved error messages
        if (result.error.includes('Email not confirmed')) {
          toast.error('Email not confirmed', {
            description: 'Please check your email to confirm your account.',
          });
        } else if (result.error.includes('Invalid login credentials')) {
          toast.error('Invalid credentials', {
            description: 'Please check your email and password and try again.',
          });
        } else {
          toast.error('Login failed', {
            description: result.error,
          });
        }
      } else {
        console.log('Login successful, redirecting to:', returnPath);
        toast.success('Welcome back!', {
          description: 'You have successfully logged in.',
        });
        // Pass along any prompt data that came with the redirect
        navigate(returnPath, { state: promptData });
      }
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast.error('An unexpected error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading">Login</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
            {locationState?.returnTo && (
              <p className="text-sm text-brand-purple">
                You'll be redirected back after login
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {formErrors.password && (
                  <p className="text-xs text-red-500">{formErrors.password}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center flex-col space-y-2">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-purple hover:underline">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
