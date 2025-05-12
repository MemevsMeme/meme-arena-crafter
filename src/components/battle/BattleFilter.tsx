
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type BattleFilterType = 'all' | 'community' | 'official';

interface BattleFilterProps {
  activeFilter: BattleFilterType;
  onFilterChange: (filter: BattleFilterType) => void;
}

const BattleFilter = ({ activeFilter, onFilterChange }: BattleFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterButton 
        active={activeFilter === 'all'} 
        onClick={() => onFilterChange('all')}
      >
        All Battles
      </FilterButton>
      <FilterButton 
        active={activeFilter === 'community'} 
        onClick={() => onFilterChange('community')}
      >
        Community Battles
      </FilterButton>
      <FilterButton 
        active={activeFilter === 'official'} 
        onClick={() => onFilterChange('official')}
      >
        Official Battles
      </FilterButton>
    </div>
  );
};

const FilterButton = ({ active, onClick, children }: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}) => (
  <Button
    variant={active ? "default" : "outline"}
    size="sm"
    onClick={onClick}
    className={cn(
      active ? "bg-brand-purple hover:bg-brand-purple/90" : "",
    )}
  >
    {children}
  </Button>
);

export default BattleFilter;
