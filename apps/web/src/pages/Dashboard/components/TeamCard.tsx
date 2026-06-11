import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import type { Team } from "@/interfaces";

interface TeamCardProps {
  team: Team;
  onClick: (teamId: number) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onClick }) => {
  return (
    <Card
      className="min-h-40 cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onClick(team.id)}
    >
      <CardHeader>
        <CardTitle className="text-lg">{team.name}</CardTitle>
        <CardDescription>Espacio de trabajo del equipo</CardDescription>
      </CardHeader>
    </Card>
  );
};
