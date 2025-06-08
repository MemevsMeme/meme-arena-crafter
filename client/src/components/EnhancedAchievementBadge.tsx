import React from 'react';
import { motion } from 'framer-motion';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import type { Achievement } from './UserAchievements';
import { Trophy, Medal, Award, Star, Crown, Laugh, Zap, ThumbsUp, Heart, Flame, Users } from 'lucide-react';

// Achievement tier colors with gradients
const tierColors = {
  bronze: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white',
  silver: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white',
  gold: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white',
  platinum: 'bg-gradient-to-br from-indigo-500 to-indigo-800 text-white'
};

// Component for rendering an enhanced achievement badge with animations
const EnhancedAchievementBadge: React.FC<{ 
  achievement: Achievement, 
  size?: 'sm' | 'md' | 'lg',
  showTooltip?: boolean
}> = ({ 
  achievement, 
  size = 'md',
  showTooltip = true
}) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };
  
  const iconSizeClass = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  // Determine which icon to display
  const getIcon = () => {
    if (typeof achievement.icon === 'string') {
      switch (achievement.icon) {
        case 'Trophy': return <Trophy className={iconSizeClass[size]} />;
        case 'Medal': return <Medal className={iconSizeClass[size]} />;
        case 'Award': return <Award className={iconSizeClass[size]} />;
        case 'Star': return <Star className={iconSizeClass[size]} />;
        case 'Crown': return <Crown className={iconSizeClass[size]} />;
        case 'Laugh': return <Laugh className={iconSizeClass[size]} />;
        case 'Zap': return <Zap className={iconSizeClass[size]} />;
        case 'ThumbsUp': return <ThumbsUp className={iconSizeClass[size]} />;
        case 'Heart': return <Heart className={iconSizeClass[size]} />;
        case 'Flame': return <Flame className={iconSizeClass[size]} />;
        case 'Users': return <Users className={iconSizeClass[size]} />;
        default: return <Star className={iconSizeClass[size]} />;
      }
    } else {
      // If it's already a React element, just return it
      return achievement.icon;
    }
  };
  
  // Animation variants for the badge
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0.6 },
    earned: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        duration: 0.5,
      }
    },
    unearned: { 
      scale: 0.95, 
      opacity: 0.7,
      transition: { 
        type: "spring",
        duration: 0.3,
      }
    },
    hover: { 
      scale: 1.05, 
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };
  
  // Animation for the icon inside the badge
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0.8 },
    earned: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        delay: 0.1,
      }
    },
    unearned: { 
      scale: 0.9, 
      opacity: 0.7,
    },
    hover: { 
      rotate: [0, -5, 5, 0],
      transition: { 
        duration: 0.5,
        repeat: 0,
      }
    }
  };
  
  // Glow animation for earned badges
  const glowVariants = {
    initial: { opacity: 0 },
    earned: { 
      opacity: [0.2, 0.5, 0.2],
      scale: [0.85, 1.05, 0.85],
      transition: { 
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 2,
      }
    }
  };
  
  const badge = (
    <motion.div 
      className="relative"
      initial="initial"
      animate={achievement.earned ? "earned" : "unearned"}
      whileHover="hover"
    >
      {/* Animated glow effect for earned achievements */}
      {achievement.earned && (
        <motion.div 
          className={`absolute inset-0 rounded-full blur-md -z-10 ${
            achievement.tier 
              ? tierColors[achievement.tier].replace('text-white', '')
              : 'bg-primary/40'
          }`}
          variants={glowVariants}
        />
      )}
      
      {/* Main badge */}
      <motion.div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center 
          ${achievement.earned 
            ? achievement.tier 
              ? tierColors[achievement.tier] 
              : 'bg-gradient-to-br from-primary to-primary-foreground text-primary-foreground' 
            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600'} 
          shadow-lg`}
        variants={badgeVariants}
      >
        {/* Icon with its own animation */}
        <motion.div variants={iconVariants}>
          {getIcon()}
        </motion.div>
      </motion.div>
    </motion.div>
  );
  
  if (!showTooltip) return badge;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <p className="font-bold text-base">{achievement.name}</p>
              {achievement.tier && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  achievement.tier === 'bronze' ? 'bg-amber-700 text-white' :
                  achievement.tier === 'silver' ? 'bg-slate-400 text-white' :
                  achievement.tier === 'gold' ? 'bg-amber-500 text-white' :
                  'bg-indigo-600 text-white'
                }`}>
                  {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            {achievement.progress !== undefined && achievement.maxProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{achievement.progress} / {achievement.maxProgress}</span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.maxProgress) * 100} 
                  className="h-2"
                  aria-label="Achievement progress"
                />
              </div>
            )}
            {achievement.earned && achievement.date && (
              <p className="text-xs text-muted-foreground mt-1">
                Earned on {new Date(achievement.date).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EnhancedAchievementBadge;