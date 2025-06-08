import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, Star, Crown, Laugh, ThumbsUp, Heart, Flame, Users, Zap } from 'lucide-react';
import type { Achievement } from './UserAchievements';

interface AnimatedAchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
}

// Achievement tier colors with gradients
const tierGradients = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-slate-300 to-slate-500',
  gold: 'from-amber-400 to-amber-600',
  platinum: 'from-indigo-500 to-indigo-800'
};

const AnimatedAchievementCard: React.FC<AnimatedAchievementCardProps> = ({ 
  achievement,
  onClick
}) => {
  // Get the appropriate icon component
  const getIcon = () => {
    if (typeof achievement.icon === 'string') {
      switch (achievement.icon) {
        case 'Trophy': return <Trophy className="h-8 w-8" />;
        case 'Medal': return <Medal className="h-8 w-8" />;
        case 'Award': return <Award className="h-8 w-8" />;
        case 'Star': return <Star className="h-8 w-8" />;
        case 'Crown': return <Crown className="h-8 w-8" />;
        case 'Laugh': return <Laugh className="h-8 w-8" />;
        case 'Zap': return <Zap className="h-8 w-8" />;
        case 'ThumbsUp': return <ThumbsUp className="h-8 w-8" />;
        case 'Heart': return <Heart className="h-8 w-8" />;
        case 'Flame': return <Flame className="h-8 w-8" />;
        case 'Users': return <Users className="h-8 w-8" />;
        default: return <Star className="h-8 w-8" />;
      }
    } else {
      return achievement.icon;
    }
  };
  
  // Card animation variants
  const cardVariants = {
    initial: { 
      y: 20, 
      opacity: 0 
    },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }
    },
    hover: { 
      y: -5,
      scale: 1.03,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Badge animation variants
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0.8 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        delay: 0.2,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Icon animation for earned achievements
  const iconVariants = {
    initial: { scale: 0.8, rotate: 0 },
    animate: achievement.earned ? {
      scale: [0.9, 1.1, 0.9],
      rotate: [-5, 5, -5],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
      }
    } : {
      scale: 0.9,
      opacity: 0.6
    }
  };
  
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
      className={`cursor-pointer`}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        {/* Achievement badge header with gradient background */}
        <div 
          className={`flex justify-center items-center p-6 bg-gradient-to-br ${
            achievement.earned 
              ? achievement.tier 
                ? tierGradients[achievement.tier] 
                : 'from-primary to-primary-foreground' 
              : 'from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'
          }`}
        >
          <motion.div 
            variants={badgeVariants}
            className={`rounded-full bg-white/90 dark:bg-gray-900/90 p-4 shadow-lg`}
          >
            <motion.div
              variants={iconVariants}
              className={`text-${
                achievement.tier === 'bronze' ? 'amber-700' :
                achievement.tier === 'silver' ? 'slate-400' :
                achievement.tier === 'gold' ? 'amber-500' :
                achievement.tier === 'platinum' ? 'indigo-600' :
                'primary'
              }`}
            >
              {getIcon()}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Achievement information */}
        <CardContent className="pt-4 pb-2 flex-grow">
          <h3 className="font-bold text-center mb-1">{achievement.name}</h3>
          <p className="text-sm text-muted-foreground text-center mb-3">{achievement.description}</p>
          
          {/* Progress bar for achievements with progress tracking */}
          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mt-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{achievement.earned ? 'Completed' : 'Progress'}</span>
                <span>{achievement.progress}/{achievement.maxProgress}</span>
              </div>
              <Progress 
                value={(achievement.progress / achievement.maxProgress) * 100} 
                className={`h-2 ${achievement.earned ? 'bg-primary/20' : ''}`}
                aria-label={`Progress towards ${achievement.name}`}
              />
            </div>
          )}
        </CardContent>
        
        {/* Footer with earned status */}
        <CardFooter className="pt-0 pb-4 justify-center">
          {achievement.earned ? (
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full font-medium">
              {achievement.date 
                ? `Earned on ${new Date(achievement.date).toLocaleDateString()}`
                : 'Achievement Unlocked'}
            </span>
          ) : (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full font-medium">
              Locked
            </span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AnimatedAchievementCard;