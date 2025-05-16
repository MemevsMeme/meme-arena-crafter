
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ImportChallenges = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const importAllChallenges = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ezunpjcxnrfnpcsibtyb.supabase.co/functions/v1/import-daily-challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6dW5wamN4bnJmbnBjc2lidHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDMzNzMsImV4cCI6MjA2MjQ3OTM3M30.eMCv2hMmifpFuK3e7y_tS5X0B6LqIGBNlvef3z_nPQc'
        },
        body: JSON.stringify({ mode: 'all' }),
        credentials: 'omit' // Ensure we're not sending cookies
      });
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Server responded with invalid JSON: ${responseText.substring(0, 100)}...`);
      }
      
      setResult(data);
      
      if (!response.ok || data.error) {
        const errorMessage = data.error || `Server responded with status ${response.status}`;
        toast.error('Error importing challenges: ' + errorMessage);
      } else {
        toast.success(`Successfully imported ${data.inserted} daily challenges!`);
      }
    } catch (error) {
      console.error('Error importing challenges:', error);
      toast.error('Failed to import challenges: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const importSingleDay = async () => {
    const day = prompt('Enter day of year (1-365):');
    if (!day) return;
    
    const dayNum = parseInt(day, 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 365) {
      toast.error('Please enter a valid day between 1 and 365');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('https://ezunpjcxnrfnpcsibtyb.supabase.co/functions/v1/import-daily-challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6dW5wamN4bnJmbnBjc2lidHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDMzNzMsImV4cCI6MjA2MjQ3OTM3M30.eMCv2hMmifpFuK3e7y_tS5X0B6LqIGBNlvef3z_nPQc'
        },
        body: JSON.stringify({ mode: 'day', day: dayNum }),
        credentials: 'omit' // Ensure we're not sending cookies
      });
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Server responded with invalid JSON: ${responseText.substring(0, 100)}...`);
      }
      
      setResult(data);
      
      if (!response.ok || data.error) {
        const errorMessage = data.error || `Server responded with status ${response.status}`;
        toast.error('Error importing challenge: ' + errorMessage);
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
