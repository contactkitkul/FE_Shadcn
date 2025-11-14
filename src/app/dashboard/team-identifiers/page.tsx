"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Pencil, Save, X, RefreshCw } from "lucide-react";
import { clearTeamIdentifiersCache } from "@/lib/api";

interface TeamIdentifier {
  id: string;
  team: string;
  identifier: string;
}

interface LeagueIdentifier {
  id: string;
  league: string;
  identifier: string;
}

export default function TeamIdentifiersPage() {
  const [teamIdentifiers, setTeamIdentifiers] = useState<TeamIdentifier[]>([]);
  const [leagueIdentifiers, setLeagueIdentifiers] = useState<LeagueIdentifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editingLeague, setEditingLeague] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchIdentifiers();
  }, []);

  const fetchIdentifiers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-identifiers`);
      const result = await response.json();

      if (result.success) {
        setTeamIdentifiers(result.data.teams || []);
        setLeagueIdentifiers(result.data.leagues || []);
      } else {
        toast.error("Failed to fetch identifiers");
      }
    } catch (error) {
      console.error("Error fetching identifiers:", error);
      toast.error("Error loading identifiers");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (id: string, currentIdentifier: string) => {
    setEditingTeam(id);
    setEditValue(currentIdentifier);
  };

  const handleEditLeague = (id: string, currentIdentifier: string) => {
    setEditingLeague(id);
    setEditValue(currentIdentifier);
  };

  const handleSaveTeam = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/team-identifiers/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: editValue }),
        }
      );

      if (response.ok) {
        toast.success("Team identifier updated");
        clearTeamIdentifiersCache(); // Clear cache so frontend gets new values
        setEditingTeam(null);
        fetchIdentifiers();
      } else {
        toast.error("Failed to update identifier");
      }
    } catch (error) {
      console.error("Error updating team identifier:", error);
      toast.error("Error updating identifier");
    }
  };

  const handleSaveLeague = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/league-identifiers/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: editValue }),
        }
      );

      if (response.ok) {
        toast.success("League identifier updated");
        clearTeamIdentifiersCache(); // Clear cache so frontend gets new values
        setEditingLeague(null);
        fetchIdentifiers();
      } else {
        toast.error("Failed to update identifier");
      }
    } catch (error) {
      console.error("Error updating league identifier:", error);
      toast.error("Error updating identifier");
    }
  };

  const handleCancel = () => {
    setEditingTeam(null);
    setEditingLeague(null);
    setEditValue("");
  };

  const formatName = (name: string) => {
    return name.replace(/_/g, " ");
  };

  const filteredTeams = teamIdentifiers.filter((team) =>
    formatName(team.team).toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeagues = leagueIdentifiers.filter((league) =>
    formatName(league.league).toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team & League Identifiers</h1>
          <p className="text-muted-foreground">
            Manage 4-letter team codes and 2-letter league codes
          </p>
        </div>
        <Button onClick={fetchIdentifiers} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search teams or leagues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">
            Team Identifiers ({teamIdentifiers.length})
          </TabsTrigger>
          <TabsTrigger value="leagues">
            League Identifiers ({leagueIdentifiers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Team Identifiers</CardTitle>
              <CardDescription>
                4-letter codes used in SKU generation (e.g., MANU, REAL, AJAX)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">
                        {formatName(team.team)}
                      </TableCell>
                      <TableCell>
                        {editingTeam === team.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                            maxLength={4}
                            className="w-24"
                            autoFocus
                          />
                        ) : (
                          <code className="bg-muted px-2 py-1 rounded">
                            {team.identifier}
                          </code>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingTeam === team.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveTeam(team.id)}
                              disabled={editValue.length !== 4}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTeam(team.id, team.identifier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leagues">
          <Card>
            <CardHeader>
              <CardTitle>League Identifiers</CardTitle>
              <CardDescription>
                2-letter codes for leagues (e.g., PL, LL, SA)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>League</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeagues.map((league) => (
                    <TableRow key={league.id}>
                      <TableCell className="font-medium">
                        {formatName(league.league)}
                      </TableCell>
                      <TableCell>
                        {editingLeague === league.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                            maxLength={2}
                            className="w-16"
                            autoFocus
                          />
                        ) : (
                          <code className="bg-muted px-2 py-1 rounded">
                            {league.identifier}
                          </code>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingLeague === league.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveLeague(league.id)}
                              disabled={editValue.length !== 2}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditLeague(league.id, league.identifier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
