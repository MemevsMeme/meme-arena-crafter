
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';

const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-gradient-to-r from-brand-purple to-brand-orange rounded-lg p-1.5 mr-2">
              <img src="/lovable-uploads/88a9df58-1bce-4ab2-b65e-ec70cfcc63ca.png" alt="Logo" className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg">{APP_NAME}</span>
          </div>

          <div className="flex flex-wrap justify-center space-x-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <a href="mailto:support@memevsmeme.com" className="hover:text-foreground">Contact</a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/40 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved. 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
