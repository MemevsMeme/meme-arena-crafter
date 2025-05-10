
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-gradient-to-r from-brand-purple to-brand-orange rounded-lg p-1.5 mr-2">
              <img src="/placeholder.svg" alt="Logo" className="h-5 w-5 invert" />
            </div>
            <span className="font-heading text-lg">MemeCrafter</span>
          </div>

          <div className="flex flex-wrap justify-center space-x-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <a href="mailto:support@memecrafter.com" className="hover:text-foreground">Contact</a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/40 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MemeCrafter. All rights reserved. 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
