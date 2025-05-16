import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getActiveBattles } from '@/lib/database/battles';
import { Battle } from '@/lib/types';

const Leaderboard = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBattles = async () => {
      setLoading(true);
      try {
        const activeBattles = await getActiveBattles(10);
        setBattles(activeBattles);
      } catch (error) {
        console.error("Error fetching battles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow w-full px-4 py-6 bg-gradient-to-b from-background to-muted/30">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-heading">Leaderboard</h1>
            <p className="text-muted-foreground">Top Battles and Users</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Battles</CardTitle>
              <CardDescription>List of ongoing battles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p>Loading battles...</p>
              ) : (
                <Table>
                  <TableCaption>A list of your recent battles.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battles.map((battle) => (
                      <TableRow key={battle.id}>
                        <TableCell className="font-medium">{battle.status}</TableCell>
                        <TableCell>
                          {battle.prompt && (
                            <p className="text-sm text-muted-foreground">
                              {typeof battle.prompt === 'string' ? battle.prompt : battle.prompt.text}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{battle.startTime.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" asChild>
                            <Link to={`/battle/${battle.id}`}>View Battle</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
