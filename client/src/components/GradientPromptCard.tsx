import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface Metadata {
  icon: ReactNode;
  text: string;
}

interface GradientPromptCardProps {
  title: string;
  prompt: string;
  metadata?: Metadata[];
  tag?: string;
  className?: string;
}

const GradientPromptCard = ({ title, prompt, metadata, tag, className }: GradientPromptCardProps) => {
  return (
    <Card className={cn(
      "overflow-hidden border-none bg-gradient-to-br from-indigo-800 via-purple-900 to-indigo-900 shadow-lg",
      className
    )}>
      <CardContent className="p-6 relative">
        <div className="absolute top-3 right-3 text-violet-300 dark:text-violet-300 animate-pulse">
          <Sparkles size={20} />
        </div>
        <h3 className="text-xl font-bold mb-1 text-violet-300">
          {title}
        </h3>
        <p className="text-2xl font-bold text-white mb-4">"{prompt}"</p>
        
        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {metadata.map((item, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 flex items-center gap-1 px-3 py-1 rounded-full"
              >
                {item.icon}
                {item.text}
              </Badge>
            ))}
          </div>
        )}
        
        {tag && (
          <Badge className="bg-violet-700 text-white px-3 py-1 rounded-full">
            {tag}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default GradientPromptCard;