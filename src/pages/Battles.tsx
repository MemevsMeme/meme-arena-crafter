
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Battle } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveBattles } from '@/lib/database';
import { getPrompts } from '@/lib/databaseAdapter';

type BattleFilterType = 'active' | 'completed' | 'community' | 'all';

const Battles = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [filter, setFilter] = useState<BattleFilterType>('active');
  const { session } = useAuth();

  useEffect(() => {
    const fetchBattles = async () => {
      // Fetch battles based on the selected filter
      const status = filter === 'community' ? 'all' : filter === 'all' ? 'all' : filter;
      const battles = await getActiveBattles(10, 0, status);
      setBattles(battles);
    };

    fetchBattles();
  }, [filter]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Active Battles</h1>

          <Select onValueChange={(value: BattleFilterType) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {battles.map(battle => (
            <Link key={battle.id} to={`/battle/${battle.id}`} className="block">
              <Card className="bg-background shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Battle #{battle.id.substring(0, 8)}</CardTitle>
                  <CardDescription>
                    {battle.prompt && battle.prompt.toString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Start Time: {battle.startTime.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    End Time: {battle.endTime.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {battle.status}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Battles;
