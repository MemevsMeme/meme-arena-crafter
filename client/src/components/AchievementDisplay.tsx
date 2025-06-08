import React from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import type { Achievement } from '@/components/UserAchievements';

interface AchievementDisplayProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

// Achievement tier colors
const tierColors = {
  bronze: 'bg-amber-700 text-white',
  silver: 'bg-slate-400 text-white',
  gold: 'bg-amber-500 text-white',
  platinum: 'bg-indigo-700 text-white'
};

const AchievementDisplay: React.FC<AchievementDisplayProps> = ({
  achievement,
  size = 'md',
  showDetails = true,
  onClick
}) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  return (
    <Card 
      className={`overflow-hidden transition-all ${showDetails ? 'hover:shadow-md' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center space-x-4">
          <div 
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center 
              ${achievement.earned 
                ? achievement.tier ? tierColors[achievement.tier] : 'bg-primary text-primary-foreground'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600'} 
              shadow-md`}
          >
            {achievement.icon}
          </div>
          
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center">
              <span>{achievement.name}</span>
              {achievement.earned && (
                <Badge variant="outline" className="ml-2 bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <Trophy className="h-3 w-3 mr-1" />
                  Earned
                </Badge>
              )}
            </CardTitle>
            {showDetails && (
              <CardDescription>
                {achievement.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      {showDetails && achievement.progress !== undefined && achievement.maxProgress && (
        <CardContent className="p-4 pt-0">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{achievement.progress} / {achievement.maxProgress}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2" 
              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
              aria-label={`${Math.round((achievement.progress / achievement.maxProgress) * 100)}% progress towards ${achievement.name}`}
            />
          </div>
        </CardContent>
      )}
      
      {showDetails && achievement.earned && achievement.date && (
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          Earned on {new Date(achievement.date).toLocaleDateString()}
        </CardFooter>
      )}
    </Card>
  );
};

export default AchievementDisplay;