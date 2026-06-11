import React from "react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { TeamCard } from "./TeamCard";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import type { Team } from "@/interfaces";

interface TeamsGridProps {
  teams: Team[];
  isLoading: boolean;
  onTeamClick: (teamId: number) => void;
  onCreateTeam: (teamName: string) => Promise<void>;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export const TeamsGrid: React.FC<TeamsGridProps> = ({
  teams,
  isLoading,
  onTeamClick,
  onCreateTeam,
  isDialogOpen,
  onDialogOpenChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <CreateTeamDialog
        onCreateTeam={onCreateTeam}
        isOpen={isDialogOpen}
        onOpenChange={onDialogOpenChange}
      />

      {isLoading ? (
        <LoadingState />
      ) : teams.length === 0 ? (
        <EmptyState />
      ) : (
        teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onClick={onTeamClick}
          />
        ))
      )}
    </div>
  );
};
