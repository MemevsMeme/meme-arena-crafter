import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Star, Crown } from 'lucide-react';
import type { Achievement } from './UserAchievements';

interface AchievementShowcaseProps {
  achievements: Achievement[];
  userId: number;
  username?: string;
  compact?: boolean;
}

// Categories with their corresponding icons
const categoryIcons = {
  creation: <Star className="h-4 w-4" />,
  battle: <Trophy className="h-4 w-4" />,
  social: <Crown className="h-4 w-4" />,
  special: <Award className="h-4 w-4" />
};

const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({
  achievements,
  userId,
  username,
  compact = false
}) => {
  const [activeCategory, setActiveCategory] = useState<'rare' | 'recent' | 'all'>('rare');
  
  // Get rare/prestigious achievements (gold, platinum)
  const rareAchievements = achievements
    .filter(a => a.earned && (a.tier === 'gold' || a.tier === 'platinum'))
    .slice(0, compact ? 3 : 6);
    
  // Get most recently earned achievements
  const recentAchievements = achievements
    .filter(a => a.earned && a.date)
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .slice(0, compact ? 3 : 6);
    
  // Count achievements by tier
  const tiers = {
    bronze: achievements.filter(a => a.earned && a.tier === 'bronze').length,
    silver: achievements.filter(a => a.earned && a.tier === 'silver').length,
    gold: achievements.filter(a => a.earned && a.tier === 'gold').length,
    platinum: achievements.filter(a => a.earned && a.tier === 'platinum').length
  };
  
  // Get current display achievements based on active category
  const displayAchievements = 
    activeCategory === 'rare' ? rareAchievements :
    activeCategory === 'recent' ? recentAchievements :
    achievements.filter(a => a.earned).slice(0, compact ? 3 : 9);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  // Render achievement badges with motion effects
  const renderAchievementBadge = (achievement: Achievement) => {
    // Get background color based on tier
    const getBgColor = () => {
      switch (achievement.tier) {
        case 'bronze': return 'bg-gradient-to-br from-amber-600 to-amber-800';
        case 'silver': return 'bg-gradient-to-br from-slate-300 to-slate-500';
        case 'gold': return 'bg-gradient-to-br from-amber-400 to-amber-600';
        case 'platinum': return 'bg-gradient-to-br from-indigo-500 to-indigo-800';
        default: return 'bg-gradient-to-br from-primary to-primary-foreground';
      }
    };
    
    // Get icon based on achievement icon property
    const getIcon = () => {
      if (typeof achievement.icon === 'string') {
        switch (achievement.icon) {
          case 'Trophy': return <Trophy className="h-5 w-5 text-white" />;
          case 'Medal': return <Medal className="h-5 w-5 text-white" />;
          case 'Award': return <Award className="h-5 w-5 text-white" />;
          case 'Star': return <Star className="h-5 w-5 text-white" />;
          case 'Crown': return <Crown className="h-5 w-5 text-white" />;
          default: return <Star className="h-5 w-5 text-white" />;
        }
      } else {
        // If it's already a component, just wrap it
        return React.cloneElement(achievement.icon as React.ReactElement, { 
          className: "h-5 w-5 text-white" 
        });
      }
    };
    
    return (
      <motion.div
        key={achievement.id}
        variants={itemVariants}
        className="flex flex-col items-center"
      >
        <motion.div 
          className={`h-12 w-12 rounded-full ${getBgColor()} flex items-center justify-center shadow-md`}
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              transition: { 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse" as const,
                repeatDelay: 3
              }
            }}
          >
            {getIcon()}
          </motion.div>
        </motion.div>
        
        <span className="mt-2 text-xs font-medium text-center max-w-[80px] truncate">
          {achievement.name}
        </span>
      </motion.div>
    );
  };
  
  return (
    <Card className={`${compact ? 'p-3' : 'p-4'}`}>
      <CardHeader className={`${compact ? 'px-2 py-2' : 'px-4 pb-2'} flex flex-row items-center justify-between`}>
        <div>
          <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} flex items-center`}>
            <Trophy className="mr-2 text-amber-500" />
            {username ? `${username}'s Achievements` : 'Achievements'}
          </CardTitle>
          {!compact && (
            <CardDescription>
              {tiers.bronze + tiers.silver + tiers.gold + tiers.platinum} earned
            </CardDescription>
          )}
        </div>
        
        {!compact && (
          <div className="flex gap-1">
            <Badge variant="outline" className="bg-amber-700/10 text-amber-700 border-amber-700/20">
              <Medal className="h-3 w-3 mr-1" /> {tiers.bronze}
            </Badge>
            <Badge variant="outline" className="bg-slate-400/10 text-slate-500 border-slate-400/20">
              <Medal className="h-3 w-3 mr-1" /> {tiers.silver}
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
              <Medal className="h-3 w-3 mr-1" /> {tiers.gold}
            </Badge>
            <Badge variant="outline" className="bg-indigo-600/10 text-indigo-600 border-indigo-600/20">
              <Crown className="h-3 w-3 mr-1" /> {tiers.platinum}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className={`${compact ? 'px-2 pt-0' : 'pt-0'}`}>
        {!compact && (
          <Tabs defaultValue="rare" className="mb-4" onValueChange={(value) => setActiveCategory(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rare">Rare</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {displayAchievements.length > 0 ? (
          <motion.div 
            className={`grid ${compact ? 'grid-cols-3 gap-3' : 'grid-cols-3 md:grid-cols-6 gap-4'}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {displayAchievements.map(achievement => renderAchievementBadge(achievement))}
          </motion.div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No achievements to display</p>
            {!compact && <p className="text-sm mt-1">Complete challenges to earn achievements!</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementShowcase;