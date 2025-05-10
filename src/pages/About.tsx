
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading mb-6">About MemeVsMeme</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="lead text-xl mb-6">
              MemeVsMeme is a creative platform where users can create memes with AI assistance, 
              battle other creators, and climb the leaderboard in fun meme competitions.
            </p>
            
            <h2 className="text-2xl font-heading mt-8 mb-4">Our Mission</h2>
            <p>
              We believe that humor connects people. Our mission is to create a fun, 
              supportive community where creativity flourishes and anyone can become a meme legend.
            </p>
            
            <h2 className="text-2xl font-heading mt-8 mb-4">How It Works</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Create Memes</strong> - Use our AI-powered tools to generate captions
                for daily meme challenges or create your own custom memes.
              </li>
              <li>
                <strong>Enter Battles</strong> - Submit your memes to head-to-head battles where
                the community votes for their favorites.
              </li>
              <li>
                <strong>Earn XP & Recognition</strong> - Win battles to earn XP, level up,
                and climb the leaderboard to become a meme legend.
              </li>
              <li>
                <strong>Build Community</strong> - Follow creators, comment on memes,
                and share your favorites across social media.
              </li>
            </ol>
            
            <h2 className="text-2xl font-heading mt-8 mb-4">Platform Features</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-muted p-5 rounded-lg">
                <h3 className="font-heading text-xl mb-2">AI Meme Generation</h3>
                <p>Generate witty captions for your memes with our AI assistant. Multiple styles available.</p>
              </div>
              
              <div className="bg-muted p-5 rounded-lg">
                <h3 className="font-heading text-xl mb-2">Daily Challenges</h3>
                <p>Participate in daily meme challenges with new prompts to keep creativity flowing.</p>
              </div>
              
              <div className="bg-muted p-5 rounded-lg">
                <h3 className="font-heading text-xl mb-2">Battle System</h3>
                <p>Go head-to-head with other creators in meme battles decided by community votes.</p>
              </div>
              
              <div className="bg-muted p-5 rounded-lg">
                <h3 className="font-heading text-xl mb-2">Leaderboard</h3>
                <p>Climb the ranks and earn recognition as your memes win battles and gain popularity.</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-heading mt-8 mb-4">Coming Soon</h2>
            <p>We're constantly working to improve MemeVsMeme. Here's what's coming soon:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Enhanced AI caption generation with more styles and customization</li>
              <li>User profiles with achievements and badges</li>
              <li>Tournament mode for larger competitions</li>
              <li>Mobile app for creating memes on the go</li>
              <li>Premium features for power users</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
