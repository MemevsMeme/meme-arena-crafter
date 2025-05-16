
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';

const ImportChallenges = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Check if the current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        setIsAdmin(!!profile?.is_admin);
      }
    };
    
    checkAdminStatus();
  }, []);

  const importAllChallenges = async () => {
    if (!session) {
      toast.error('You must be logged in to import challenges');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-daily-challenges', {
        body: { mode: 'all' }
      });

      setResult(data);
      
      if (error) {
        toast.error('Error importing challenges: ' + error.message);
      } else {
        toast.success(`Successfully imported ${data?.inserted || 0} daily challenges!`);
      }
    } catch (error) {
      console.error('Error importing challenges:', error);
      toast.error('Failed to import challenges: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const importSingleDay = async () => {
    if (!session) {
      toast.error('You must be logged in to import challenges');
      return;
    }
    
    const day = prompt('Enter day of year (1-365):');
    if (!day) return;
    
    const dayNum = parseInt(day, 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 365) {
      toast.error('Please enter a valid day between 1 and 365');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-daily-challenges', {
        body: { mode: 'day', day: dayNum }
      });
      
      setResult(data);
      
      if (error) {
        toast.error('Error importing challenge: ' + error.message);
      } else {
        toast.success(`Successfully imported challenge for day ${dayNum}!`);
      }
    } catch (error) {
      console.error('Error importing challenge:', error);
      toast.error('Failed to import challenge: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Import Daily Challenges</h1>
        
        {!session ? (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="mb-4 text-muted-foreground">
              You need to be logged in as an admin user to import daily challenges.
            </p>
            <Button onClick={() => navigate('/login')}>Login</Button>
          </Card>
        ) : !isAdmin ? (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Admin Access Required</h2>
            <p className="mb-4 text-muted-foreground">
              You need to have admin privileges to import daily challenges.
            </p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </Card>
        ) : (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Daily Challenge Import</h2>
            <p className="mb-4 text-muted-foreground">
              This utility allows you to import all 365 daily meme challenges into the Supabase database.
              You only need to do this once to populate the database.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                onClick={importAllChallenges} 
                disabled={loading}
                variant="default"
              >
                {loading ? 'Importing...' : 'Import All 365 Challenges'}
              </Button>
              
              <Button 
                onClick={importSingleDay} 
                disabled={loading}
                variant="outline"
              >
                Import Single Day
              </Button>
              
              <Button 
                onClick={() => navigate('/')} 
                variant="secondary"
              >
                Return to Home
              </Button>
            </div>
          </Card>
        )}
        
        {result && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Import Result</h2>
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ImportChallenges;
