import React from "react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { TeamCard } from "./TeamCard";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { InviteCard } from "./InviteCard";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks";

const API_BASE_URL = import.meta.env.VITE_API_URL;
interface TeamsGridProps {
  isLoading: boolean;
  onCreateTeam: (teamName: string) => Promise<void>;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export const TeamsGrid: React.FC<TeamsGridProps> = ({
  isLoading,
  onCreateTeam,
  isDialogOpen,
  onDialogOpenChange,
}) => {
  const navigate = useNavigate();
  const { teams, user, fetchTeams } = useDashboard();
  const handleNavigateToKanban = (teamId: number) => {
    navigate(`/team/${teamId}`);
  };

  const handleAcceptInvite = async (teamId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/team-members/changerole`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          teamId: teamId,
          role: "MEMBER",
        }),
      });

      if (!response.ok) throw Error("Error al aceptar la invitación");
      fetchTeams();
    } catch (error) {
      console.error("Error al aceptar", error);
    }
  };
  const handleRejectInvite = async (teamId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/team-members/leaveteam`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          teamId: teamId,
        }),
      });

      if (!response.ok) throw Error("Error al aceptar la invitación");
      fetchTeams();
    } catch (error) {
      console.error("Error al rechazar", error);
    }
  };
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
                onAccept={() => handleAcceptInvite(team.teamId)}
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
