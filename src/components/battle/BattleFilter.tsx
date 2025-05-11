
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BattleFilterProps {
  activeFilter: 'all' | 'official' | 'community';
  onFilterChange: (filter: 'all' | 'official' | 'community') => void;
}

const BattleFilter = ({ activeFilter, onFilterChange }: BattleFilterProps) => {
  return (
    <div className="flex justify-between items-center w-full">
      <Tabs value={activeFilter} onValueChange={(value: any) => onFilterChange(value)} className="w-auto">
        <TabsList>
          <TabsTrigger value="all">All Battles</TabsTrigger>
          <TabsTrigger value="official">Official Challenges</TabsTrigger>
          <TabsTrigger value="community">Community Battles</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Link to="/create-battle">
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Battle
        </Button>
      </Link>
    </div>
  );
};

export default BattleFilter;
