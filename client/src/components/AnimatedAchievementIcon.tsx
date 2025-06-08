import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  Medal, 
  Star, 
  Crown,
  Laugh,
  Zap,
  Users,
  ThumbsUp,
  Heart,
  Flame,
  TrendingUp,
  LucideIcon
} from 'lucide-react';

// Achievement icon animation variants
const iconAnimations = {
  trophy: {
    initial: { scale: 0.8, rotate: -5 },
    animate: { 
      scale: [0.8, 1.2, 1],
      rotate: [-5, 5, 0],
      transition: { 
        duration: 0.6,
        repeat: Infinity,
        repeatType: "reverse" as const,
        repeatDelay: 6
      }
    },
    colors: {
      primary: "#f59e0b", // amber-500
      secondary: "#fbbf24", // amber-400
      highlight: "#fef3c7" // amber-100
    }
  },
  award: {
    initial: { scale: 0.9, y: 2 },
    animate: { 
      scale: [0.9, 1.1, 0.9],
      y: [2, -2, 2],
      transition: { 
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse" as const,
        repeatDelay: 4
      }
    },
    colors: {
      primary: "#2563eb", // blue-600
      secondary: "#3b82f6", // blue-500
      highlight: "#dbeafe" // blue-100
    }
  },
  medal: {
    initial: { scale: 0.9, rotate: 0 },
    animate: { 
      scale: [0.9, 1.1, 0.9],
      rotate: [0, 5, -5, 0],
      transition: { 
        duration: 1.2,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 5
      }
    },
    colors: {
      primary: "#b45309", // amber-700
      secondary: "#d97706", // amber-600
      highlight: "#fef3c7" // amber-100
    }
  },
  star: {
    initial: { scale: 0.8 },
    animate: { 
      scale: [0.8, 1.3, 0.8],
      rotate: [0, 5, -5, 0],
      opacity: [0.8, 1, 0.8],
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 3
      }
    },
    colors: {
      primary: "#facc15", // yellow-400
      secondary: "#fcd34d", // yellow-300
      highlight: "#fef9c3" // yellow-100
    }
  },
  crown: {
    initial: { scale: 0.9, y: 0 },
    animate: { 
      scale: [0.9, 1.1, 0.9],
      y: [0, -3, 0],
      transition: { 
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 5
      }
    },
    colors: {
      primary: "#f59e0b", // amber-500
      secondary: "#fbbf24", // amber-400
      highlight: "#fde68a" // amber-200
    }
  },
  laugh: {
    initial: { scale: 0.9, rotate: 0 },
    animate: { 
      scale: [0.9, 1.1, 0.9],
      rotate: [0, 5, -5, 0],
      transition: { 
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 4
      }
    },
    colors: {
      primary: "#f97316", // orange-500
      secondary: "#fb923c", // orange-400
      highlight: "#ffedd5" // orange-100
    }
  },
  zap: {
    initial: { scale: 0.9, opacity: 0.8 },
    animate: { 
      scale: [0.9, 1.2, 0.9],
      opacity: [0.8, 1, 0.8],
      transition: { 
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 3
      }
    },
    colors: {
      primary: "#eab308", // yellow-500
      secondary: "#facc15", // yellow-400
      highlight: "#fef9c3" // yellow-100
    }
  },
  users: {
    initial: { scale: 0.9, x: 0 },
    animate: { 
      scale: [0.9, 1.05, 0.9],
      x: [0, 2, -2, 0],
      transition: { 
        duration: 1.2,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 5
      }
    },
    colors: {
      primary: "#8b5cf6", // violet-500
      secondary: "#a78bfa", // violet-400
      highlight: "#ede9fe" // violet-100
    }
  },
  thumbsUp: {
    initial: { scale: 0.9, rotate: 0 },
    animate: { 
      scale: [0.9, 1.1, 0.9],
      rotate: [0, 5, -5, 0],
      transition: { 
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 4
      }
    },
    colors: {
      primary: "#2563eb", // blue-600
      secondary: "#3b82f6", // blue-500
      highlight: "#dbeafe" // blue-100
    }
  },
  heart: {
    initial: { scale: 0.9 },
    animate: { 
      scale: [0.9, 1.2, 0.9],
      transition: { 
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 3
      }
    },
    colors: {
      primary: "#e11d48", // rose-600
      secondary: "#f43f5e", // rose-500
      highlight: "#ffe4e6" // rose-100
    }
  },
  flame: {
    initial: { scale: 0.9, y: 0 },
    animate: { 
      scale: [0.9, 1.1, 0.9],
      y: [0, -2, 0],
      transition: { 
        duration: 0.7,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 2
      }
    },
    colors: {
      primary: "#dc2626", // red-600
      secondary: "#ef4444", // red-500
      highlight: "#fee2e2" // red-100
    }
  },
  trending: {
    initial: { scale: 0.9, y: 0 },
    animate: { 
      scale: [0.9, 1.05, 0.9],
      y: [0, -3, 0],
      transition: { 
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 5
      }
    },
    colors: {
      primary: "#0ea5e9", // sky-500
      secondary: "#38bdf8", // sky-400
      highlight: "#e0f2fe" // sky-100
    }
  }
};

// SVG filter ID for the glow effect
const GLOW_FILTER_ID = "achievement-glow-filter";

// Mapping of icon types to components
const iconComponents: Record<string, React.ReactElement> = {
  Trophy: <Trophy />,
  Award: <Award />,
  Medal: <Medal />,
  Star: <Star />,
  Crown: <Crown />,
  Laugh: <Laugh />,
  Zap: <Zap />,
  Users: <Users />,
  ThumbsUp: <ThumbsUp />,
  Heart: <Heart />,
  Flame: <Flame />,
  TrendingUp: <TrendingUp />
};

// Map icon names to animation configurations
const iconToAnimation: Record<string, keyof typeof iconAnimations> = {
  Trophy: 'trophy',
  Award: 'award',
  Medal: 'medal',
  Star: 'star',
  Crown: 'crown',
  Laugh: 'laugh',
  Zap: 'zap',
  Users: 'users',
  ThumbsUp: 'thumbsUp',
  Heart: 'heart',
  Flame: 'flame',
  TrendingUp: 'trending'
};

interface AnimatedAchievementIconProps {
  iconName: string;
  size?: number;
  earned?: boolean;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  disabled?: boolean;
}

const AnimatedAchievementIcon: React.FC<AnimatedAchievementIconProps> = ({
  iconName,
  size = 24,
  earned = true,
  tier,
  disabled = false
}) => {
  const iconElement = iconComponents[iconName] || <Star />;
  const animationKey = iconToAnimation[iconName] || 'star';
  const animation = iconAnimations[animationKey];
  
  // Determine colors based on tier and earned status
  let primaryColor = animation.colors.primary;
  let secondaryColor = animation.colors.secondary;
  let highlightColor = animation.colors.highlight;
  
  if (tier) {
    switch (tier) {
      case 'bronze':
        primaryColor = '#b45309';  // amber-700
        secondaryColor = '#d97706'; // amber-600
        break;
      case 'silver':
        primaryColor = '#6b7280';  // gray-500
        secondaryColor = '#9ca3af'; // gray-400
        break;
      case 'gold':
        primaryColor = '#f59e0b';  // amber-500
        secondaryColor = '#fbbf24'; // amber-400
        break;
      case 'platinum':
        primaryColor = '#4f46e5';  // indigo-600
        secondaryColor = '#6366f1'; // indigo-500
        break;
    }
  }
  
  // For unearned/disabled icons
  if (disabled || !earned) {
    primaryColor = '#9ca3af';      // gray-400
    secondaryColor = '#d1d5db';    // gray-300
    highlightColor = '#f3f4f6';    // gray-100
  }
  
  // Include the glow filter definition once
  React.useEffect(() => {
    if (!document.getElementById(GLOW_FILTER_ID) && earned) {
      const svgNS = 'http://www.w3.org/2000/svg';
      const filter = document.createElementNS(svgNS, 'filter');
      filter.setAttribute('id', GLOW_FILTER_ID);
      
      const feGaussianBlur = document.createElementNS(svgNS, 'feGaussianBlur');
      feGaussianBlur.setAttribute('stdDeviation', '2');
      feGaussianBlur.setAttribute('result', 'blur');
      
      const feColorMatrix = document.createElementNS(svgNS, 'feColorMatrix');
      feColorMatrix.setAttribute('in', 'blur');
      feColorMatrix.setAttribute('mode', 'matrix');
      feColorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7');
      feColorMatrix.setAttribute('result', 'glow');
      
      const feBlend = document.createElementNS(svgNS, 'feBlend');
      feBlend.setAttribute('in', 'SourceGraphic');
      feBlend.setAttribute('in2', 'glow');
      feBlend.setAttribute('mode', 'normal');
      
      filter.appendChild(feGaussianBlur);
      filter.appendChild(feColorMatrix);
      filter.appendChild(feBlend);
      
      // Add filter to the SVG defs
      const defs = document.createElementNS(svgNS, 'defs');
      defs.appendChild(filter);
      
      // Add the defs to the document
      const svg = document.createElementNS(svgNS, 'svg');
      svg.style.width = '0';
      svg.style.height = '0';
      svg.style.position = 'absolute';
      svg.appendChild(defs);
      document.body.appendChild(svg);
      
      return () => {
        document.body.removeChild(svg);
      };
    }
  }, [earned]);
  
  return (
    <motion.div
      className="relative"
      initial={earned ? animation.initial : "initial"}
      animate={earned ? animation.animate : "initial"}
      style={{ 
        width: size, 
        height: size,
        filter: earned ? `url(#${GLOW_FILTER_ID})` : 'none' 
      }}
    >
      {React.cloneElement(iconElement, { 
        size,
        strokeWidth: earned ? 2 : 1.5,
        className: `text-[${primaryColor}]`,
        style: { 
          color: primaryColor,
          fill: secondaryColor,
          opacity: disabled || !earned ? 0.5 : 1
        }
      })}
      
      {/* Animated glow circle for earned achievements */}
      {earned && (
        <motion.div 
          className="absolute inset-0 rounded-full z-[-1]"
          initial={{ opacity: 0.3, scale: 0.9 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.9, 1.2, 0.9],
            transition: { 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
          style={{
            backgroundColor: highlightColor,
            boxShadow: `0 0 15px ${secondaryColor}`
          }}
        />
      )}
    </motion.div>
  );
};

export default AnimatedAchievementIcon;