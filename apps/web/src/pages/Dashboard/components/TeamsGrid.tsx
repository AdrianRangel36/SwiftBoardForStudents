import React from "react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { TeamCard } from "./TeamCard";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import type { Team } from "@/interfaces";
import { InviteCard } from "./InviteCard";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleNavigateToKanban = (teamId: number) => {
    navigate(`/team/${teamId}`);
  };

  const handleAcceptInvite = async (teamId: number) => {
    try {
      // API call a NestJS: api.patch(`/team/${teamId}/members/accept`);
      console.log("Aceptando invitación al equipo", teamId);
      // if (onRefetchTeams) onRefetchTeams(); // Refrescar vista
    } catch (error) {
      console.error("Error al aceptar", error);
    }
  };
  const handleRejectInvite = async (teamId: number) => {
    try {
      // API call a NestJS: api.delete(`/team/${teamId}/members/reject`);
      console.log("Rechazando invitación al equipo", teamId);
      // if (onRefetchTeams) onRefetchTeams(); // Refrescar vista
    } catch (error) {
      console.error("Error al rechazar", error);
    }
  };
  console.log(teams);
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
        teams.map((team) => {          
          if (team.role === "PENDING") {
            return (
              <InviteCard
                key={`invite-${team.teamId}`}
                team={team}
                onAccept={handleAcceptInvite}
                onReject={handleRejectInvite}
              />
            );
          }

          return (
            <TeamCard
              key={`team-${team.teamId}`}
              team={team}
              onClick={handleNavigateToKanban}
            />
          );
        })
      )}
    </div>
  );
};
