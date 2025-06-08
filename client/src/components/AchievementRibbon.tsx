import React from 'react';
import { Trophy, Award, Medal, Star, Crown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AchievementRibbonProps {
  type: 'winner' | 'popular' | 'trending' | 'challenge-winner' | 'bronze' | 'silver' | 'gold' | 'platinum';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  tooltipText?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A decorative ribbon or badge to display on memes that have earned achievements
 */
const AchievementRibbon: React.FC<AchievementRibbonProps> = ({
  type, 
  position = 'top-right',
  tooltipText,
  size = 'md'
}) => {
  // Map of achievement types to colors and icons
  const typeConfig = {
    'winner': {
      background: 'bg-amber-500',
      icon: <Trophy className="text-white" />
    },
    'popular': {
      background: 'bg-blue-500',
      icon: <Star className="text-white" />
    },
    'trending': {
      background: 'bg-purple-500',
      icon: <Trophy className="text-white" />
    },
    'challenge-winner': {
      background: 'bg-gradient-to-r from-amber-500 to-yellow-300',
      icon: <Crown className="text-white" />
    },
    'bronze': {
      background: 'bg-amber-700',
      icon: <Medal className="text-white" />
    },
    'silver': {
      background: 'bg-slate-400',
      icon: <Medal className="text-white" />
    },
    'gold': {
      background: 'bg-amber-500',
      icon: <Medal className="text-white" />
    },
    'platinum': {
      background: 'bg-indigo-700',
      icon: <Medal className="text-white" />
    },
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2'
  };
  
  const config = typeConfig[type];
  const badge = (
    <div className={`absolute ${positionClasses[position]} ${sizeClasses[size]} rounded-full flex items-center justify-center ${config.background} shadow-md z-10`}>
      <div className={iconSizeClasses[size]}>
        {React.cloneElement(config.icon as React.ReactElement, { 
          size: size === 'sm' ? 12 : (size === 'md' ? 16 : 20)
        })}
      </div>
    </div>
  );
  
  if (!tooltipText) return badge;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="text-xs font-medium">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementRibbon;