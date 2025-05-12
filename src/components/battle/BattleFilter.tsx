
import React from 'react';
import { Button } from '@/components/ui/button';

interface BattleFilterProps {
  activeFilter: 'all' | 'official' | 'community';
  onFilterChange: (filter: 'all' | 'official' | 'community') => void;
}

const BattleFilter: React.FC<BattleFilterProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="inline-flex p-1 rounded-md bg-muted">
      <Button
        variant={activeFilter === 'all' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('all')}
        className={activeFilter === 'all' ? '' : 'hover:bg-background/50'}
      >
        All Battles
      </Button>
      <Button
        variant={activeFilter === 'official' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('official')}
        className={activeFilter === 'official' ? '' : 'hover:bg-background/50'}
      >
        Official
      </Button>
      <Button
        variant={activeFilter === 'community' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('community')}
        className={activeFilter === 'community' ? '' : 'hover:bg-background/50'}
      >
        Community
      </Button>
    </div>
  );
};

export default BattleFilter;
