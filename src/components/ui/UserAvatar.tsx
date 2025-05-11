
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/types';

interface UserAvatarProps {
  user: Partial<User>;
  showUsername?: boolean;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  linkToProfile?: boolean;
}

const UserAvatar = ({
  user,
  showUsername = false,
  showLevel = false,
  size = 'md',
  linkToProfile = true,
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const username = user?.username || 'User';
  const initials = username ? username.substring(0, 2).toUpperCase() : 'U';

  const avatarContent = (
    <div className="flex items-center gap-2">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user?.avatarUrl} alt={username} />
        <AvatarFallback>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showUsername && (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{username}</span>
          {showLevel && user?.level && (
            <span className="text-xs text-muted-foreground">
              Lvl {user.level}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkToProfile && user?.id) {
    return (
      <Link to={`/profile/${user.id}`} className="hover:opacity-90 transition-opacity">
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
};

export default UserAvatar;
