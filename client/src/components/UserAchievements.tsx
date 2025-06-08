import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { triggerAchievementSound } from './AchievementSoundListener';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Award, 
  Target, 
  Medal, 
  ThumbsUp, 
  Flame, 
  Star, 
  TrendingUp,
  Crown,
  Laugh,
  Zap,
  Users,
  Heart 
} from 'lucide-react';
import AnimatedAchievementIcon from './AnimatedAchievementIcon';
import EnhancedAchievementBadge from './EnhancedAchievementBadge';
import AnimatedAchievementCard from './AnimatedAchievementCard';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

// Define achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  date?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'creation' | 'battle' | 'social' | 'special';
}

// Achievement tier colors
const tierColors = {
  bronze: 'bg-amber-700 text-white',
  silver: 'bg-slate-400 text-white',
  gold: 'bg-amber-500 text-white',
  platinum: 'bg-indigo-700 text-white'
};

// Achievement badges by level
export const AchievementBadge: React.FC<{ 
  achievement: Achievement, 
  size?: 'sm' | 'md' | 'lg',
  showTooltip?: boolean
}> = ({ 
  achievement, 
  size = 'md',
  showTooltip = true
}) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20'
  };
  
  const iconSizeClass = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-10 w-10'
  };
  
  const badge = (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center 
        ${achievement.earned 
          ? achievement.tier 
            ? tierColors[achievement.tier] 
            : 'bg-primary text-primary-foreground' 
          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600'} 
        ${achievement.earned ? 'shadow-lg' : ''}`}
    >
      <div className={`${iconSizeClass[size]}`}>
        {achievement.icon}
      </div>
    </div>
  );
  
  if (!showTooltip) return badge;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-bold">{achievement.name}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            {achievement.progress !== undefined && achievement.maxProgress && (
              <Progress 
                value={(achievement.progress / achievement.maxProgress) * 100} 
                className="h-2 mt-1"
                aria-label="Achievement progress"
              />
            )}
            {achievement.earned && achievement.date && (
              <p className="text-xs text-muted-foreground mt-1">Earned on {new Date(achievement.date).toLocaleDateString()}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Achievement grid component
export const AchievementGrid: React.FC<{ 
  achievements: Achievement[],
  category?: Achievement['category'],
  showLocked?: boolean
}> = ({ 
  achievements, 
  category,
  showLocked = true
}) => {
  const filteredAchievements = achievements
    .filter(a => !category || a.category === category)
    .filter(a => showLocked || a.earned);
    
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredAchievements.map(achievement => (
        <AnimatedAchievementCard 
          key={achievement.id} 
          achievement={achievement}
        />
      ))}
    </div>
  );
};

// Achievement statistics
export const AchievementStats: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => {
  const totalAchievements = achievements.length;
  const earnedAchievements = achievements.filter(a => a.earned).length;
  const earnedPercentage = Math.round((earnedAchievements / totalAchievements) * 100);
  
  // Count achievements by tier
  const tiers = {
    bronze: achievements.filter(a => a.earned && a.tier === 'bronze').length,
    silver: achievements.filter(a => a.earned && a.tier === 'silver').length,
    gold: achievements.filter(a => a.earned && a.tier === 'gold').length,
    platinum: achievements.filter(a => a.earned && a.tier === 'platinum').length
  };
  
  // Count achievements by category
  const categories = {
    creation: achievements.filter(a => a.earned && a.category === 'creation').length,
    battle: achievements.filter(a => a.earned && a.category === 'battle').length,
    social: achievements.filter(a => a.earned && a.category === 'social').length,
    special: achievements.filter(a => a.earned && a.category === 'special').length
  };
  
  // Find the most recent achievement
  const recentAchievements = achievements
    .filter(a => a.earned && a.date)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 3);
  
  return (
    <Card className="bg-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
        <CardTitle className="flex items-center">
          <motion.div
            initial={{ rotate: -5, scale: 0.9 }}
            animate={{ 
              rotate: [0, 5, 0, -5, 0],
              scale: [0.9, 1.1, 0.9],
              transition: { 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse" as const,
                repeatDelay: 5
              }
            }}
          >
            <Trophy size={24} className="mr-3 text-amber-500" />
          </motion.div>
          Achievement Collection
        </CardTitle>
        <CardDescription>
          Your journey to become a meme master
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Achievement Progress Bar */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="font-medium">{earnedAchievements}/{totalAchievements}</span>
          </div>
          <Progress 
            value={earnedPercentage} 
            className="h-3" 
            aria-label="Overall achievement progress" 
          />
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {earnedPercentage}% complete - {totalAchievements - earnedAchievements} more to unlock
          </div>
        </div>
        
        {/* Achievement Tiers */}
        <div>
          <h3 className="font-medium mb-3">Achievements By Tier</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="bg-muted p-3 rounded-lg flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="mr-3">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    transition: { 
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse" as const,
                      repeatDelay: 4
                    }
                  }}
                >
                  <Medal className="h-8 w-8 text-amber-700" />
                </motion.div>
              </div>
              <div>
                <div className="font-bold text-xl">{tiers.bronze}</div>
                <div className="text-xs text-muted-foreground">Bronze</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-muted p-3 rounded-lg flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="mr-3">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    transition: { 
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse" as const,
                      repeatDelay: 4.5
                    }
                  }}
                >
                  <Medal className="h-8 w-8 text-slate-400" />
                </motion.div>
              </div>
              <div>
                <div className="font-bold text-xl">{tiers.silver}</div>
                <div className="text-xs text-muted-foreground">Silver</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-muted p-3 rounded-lg flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="mr-3">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    transition: { 
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse" as const,
                      repeatDelay: 5
                    }
                  }}
                >
                  <Medal className="h-8 w-8 text-amber-500" />
                </motion.div>
              </div>
              <div>
                <div className="font-bold text-xl">{tiers.gold}</div>
                <div className="text-xs text-muted-foreground">Gold</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-muted p-3 rounded-lg flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="mr-3">
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ 
                    y: [0, -3, 0],
                    transition: { 
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse" as const,
                      repeatDelay: 3.5
                    }
                  }}
                >
                  <Crown className="h-8 w-8 text-indigo-600" />
                </motion.div>
              </div>
              <div>
                <div className="font-bold text-xl">{tiers.platinum}</div>
                <div className="text-xs text-muted-foreground">Platinum</div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Recently Earned */}
        {recentAchievements.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-3">Recently Earned</h3>
            <div className="space-y-2">
              {recentAchievements.map(achievement => (
                <motion.div 
                  key={achievement.id}
                  className="bg-muted rounded-lg p-3 flex items-center"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring" }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex-shrink-0 mr-3">
                    <EnhancedAchievementBadge achievement={achievement} size="sm" showTooltip={false} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{achievement.name}</p>
                      {achievement.date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(achievement.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main achievements tab component
const UserAchievements: React.FC<{ userId: number }> = ({ userId }) => {
  // Default set of all possible achievements in the system
  const [achievements, setAchievements] = React.useState<Achievement[]>([
    // Creation achievements
    {
      id: 'create_first_meme',
      name: 'Meme Apprentice',
      description: 'Create your first meme',
      icon: <Laugh />,
      earned: true,
      date: '2025-05-01',
      tier: 'bronze',
      category: 'creation'
    },
    {
      id: 'create_10_memes',
      name: 'Meme Artisan',
      description: 'Create 10 memes',
      icon: <Laugh />,
      earned: false,
      progress: 3,
      maxProgress: 10,
      tier: 'silver',
      category: 'creation'
    },
    {
      id: 'create_50_memes',
      name: 'Meme Master',
      description: 'Create 50 memes',
      icon: <Laugh />,
      earned: false,
      progress: 3,
      maxProgress: 50,
      tier: 'gold',
      category: 'creation'
    },
    {
      id: 'create_100_memes',
      name: 'Meme Legend',
      description: 'Create 100 memes',
      icon: <Laugh />,
      earned: false,
      progress: 3,
      maxProgress: 100,
      tier: 'platinum',
      category: 'creation'
    },
    
    // Battle achievements
    {
      id: 'win_battle',
      name: 'First Victory',
      description: 'Win your first meme battle',
      icon: <Trophy />,
      earned: true,
      date: '2025-05-02',
      tier: 'bronze',
      category: 'battle'
    },
    {
      id: 'win_5_battles',
      name: 'Battle Veteran',
      description: 'Win 5 meme battles',
      icon: <Trophy />,
      earned: false,
      progress: 2,
      maxProgress: 5,
      tier: 'silver',
      category: 'battle'
    },
    {
      id: 'win_20_battles',
      name: 'Battle Champion',
      description: 'Win 20 meme battles',
      icon: <Trophy />,
      earned: false,
      progress: 2,
      maxProgress: 20,
      tier: 'gold',
      category: 'battle'
    },
    {
      id: 'win_50_battles',
      name: 'Battle Legend',
      description: 'Win 50 meme battles',
      icon: <Crown />,
      earned: false,
      progress: 2,
      maxProgress: 50,
      tier: 'platinum',
      category: 'battle'
    },
    {
      id: 'create_battle',
      name: 'Battle Creator',
      description: 'Create your first meme battle',
      icon: <Zap />,
      earned: true,
      date: '2025-05-03',
      tier: 'bronze',
      category: 'battle'
    },
    {
      id: 'create_5_battles',
      name: 'Battle Organizer',
      description: 'Create 5 meme battles',
      icon: <Zap />,
      earned: false,
      progress: 2,
      maxProgress: 5,
      tier: 'silver',
      category: 'battle'
    },
    
    // Social achievements
    {
      id: 'get_10_likes',
      name: 'Liked!',
      description: 'Get 10 likes on your memes',
      icon: <ThumbsUp />,
      earned: true,
      date: '2025-05-04',
      tier: 'bronze',
      category: 'social'
    },
    {
      id: 'get_100_likes',
      name: 'Crowd Pleaser',
      description: 'Get 100 likes on your memes',
      icon: <ThumbsUp />,
      earned: false,
      progress: 35,
      maxProgress: 100,
      tier: 'silver',
      category: 'social'
    },
    {
      id: 'get_1000_likes',
      name: 'Viral Sensation',
      description: 'Get 1000 likes on your memes',
      icon: <ThumbsUp />,
      earned: false,
      progress: 35,
      maxProgress: 1000,
      tier: 'gold',
      category: 'social'
    },
    {
      id: 'share_meme',
      name: 'Social Sharer',
      description: 'Share a meme on social media',
      icon: <Users />,
      earned: true,
      date: '2025-05-05',
      tier: 'bronze',
      category: 'social'
    },
    
    // Special achievements
    {
      id: 'daily_challenge_streak_7',
      name: 'Weekly Warrior',
      description: 'Participate in daily challenges for 7 days in a row',
      icon: <Flame />,
      earned: false,
      progress: 4,
      maxProgress: 7,
      tier: 'bronze',
      category: 'special'
    },
    {
      id: 'daily_challenge_streak_30',
      name: 'Monthly Master',
      description: 'Participate in daily challenges for 30 days in a row',
      icon: <Flame />,
      earned: false,
      progress: 4,
      maxProgress: 30,
      tier: 'gold',
      category: 'special'
    },
    {
      id: 'win_daily_challenge',
      name: 'Daily Champion',
      description: 'Win a daily challenge',
      icon: <Award />,
      earned: true,
      date: '2025-05-06',
      tier: 'silver',
      category: 'special'
    },
    {
      id: 'win_5_daily_challenges',
      name: 'Challenge Conqueror',
      description: 'Win 5 daily challenges',
      icon: <Award />,
      earned: false,
      progress: 1,
      maxProgress: 5,
      tier: 'gold',
      category: 'special'
    }
  ]);
  
  const [activeCategory, setActiveCategory] = React.useState<Achievement['category'] | 'all'>('all');
  
  // Store previously earned achievements to detect new ones
  const [previousEarned, setPreviousEarned] = React.useState<string[]>([]);
  
  // Effect to load user achievements
  React.useEffect(() => {
    const fetchUserAchievements = async () => {
      try {
        const response = await fetch(`/api/achievements/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Convert text icon names to React components
          const processedAchievements = data.map((achievement: any) => {
            let iconComponent;
            
            // Convert icon string to component
            switch (achievement.icon) {
              case 'Trophy': iconComponent = <Trophy />; break;
              case 'Award': iconComponent = <Award />; break;
              case 'ThumbsUp': iconComponent = <ThumbsUp />; break;
              case 'Laugh': iconComponent = <Laugh />; break;
              case 'Flame': iconComponent = <Flame />; break;
              case 'Star': iconComponent = <Star />; break;
              case 'Crown': iconComponent = <Crown />; break;
              case 'Zap': iconComponent = <Zap />; break;
              case 'Users': iconComponent = <Users />; break;
              case 'Heart': iconComponent = <Heart />; break;
              case 'Medal': iconComponent = <Medal />; break;
              default: iconComponent = <Star />; break;
            }
            
            return {
              ...achievement,
              icon: iconComponent
            };
          });
          
          setAchievements(prevAchievements => {
            // If we have server achievements, use those
            if (processedAchievements.length > 0) {
              return processedAchievements;
            }
            // Otherwise keep the defaults
            return prevAchievements;
          });
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };
    
    if (userId) {
      fetchUserAchievements();
    }
  }, [userId]);
  
  // Effect to check for newly earned achievements and play sounds
  useEffect(() => {
    // Get list of all currently earned achievement IDs
    const currentEarned = achievements
      .filter(a => a.earned)
      .map(a => a.id);
    
    // Find newly earned achievements (earned now but not before)
    const newlyEarned = currentEarned.filter(id => !previousEarned.includes(id));
    
    // Play sounds for newly earned achievements
    if (newlyEarned.length > 0) {
      newlyEarned.forEach(id => {
        const achievement = achievements.find(a => a.id === id);
        if (achievement) {
          // Play appropriate sound based on tier
          if (achievement.tier === 'gold' || achievement.tier === 'platinum') {
            triggerAchievementSound('achievement', achievement.tier);
          } else {
            triggerAchievementSound('achievement', achievement.tier);
          }
          
          console.log(`Achievement earned: ${achievement.name}`);
        }
      });
    }
    
    // Update previously earned achievements
    setPreviousEarned(currentEarned);
  }, [achievements]);
  
  return (
    <div className="space-y-6">
      <AchievementStats achievements={achievements} />
      
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>
            Collect badges by participating in meme activities
          </CardDescription>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge 
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory('all')}
            >
              All
            </Badge>
            <Badge 
              variant={activeCategory === 'creation' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory('creation')}
            >
              <Laugh size={14} className="mr-1" /> Creation
            </Badge>
            <Badge 
              variant={activeCategory === 'battle' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory('battle')}
            >
              <Trophy size={14} className="mr-1" /> Battles
            </Badge>
            <Badge 
              variant={activeCategory === 'social' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory('social')}
            >
              <Heart size={14} className="mr-1" /> Social
            </Badge>
            <Badge 
              variant={activeCategory === 'special' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory('special')}
            >
              <Star size={14} className="mr-1" /> Special
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AchievementGrid 
            achievements={achievements} 
            category={activeCategory === 'all' ? undefined : activeCategory} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAchievements;