import { useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Users,
  ChevronDown,
  LogOut,
  LucideTableConfig,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { TeamSettingsDialog } from "./TeamSettingsDialog";
import { useKanbanStore } from "../useKanbanStore";
import type { Team, TeamMember } from "@/interfaces";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const KanbanHeader = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  
  // Obtenemos los datos del equipo del layout de React Router
  const teamData = useOutletContext<Team>();

  // Consumimos el estado global de Zustand
  const { teamMembers, user } = useKanbanStore((state) => ({
    teamMembers: state.teamMembers,
    user: state.user,
  }));

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Lógica de permisos calculada localmente con los datos del Store
  const currentMember = teamMembers.find((m) => m.userId === user?.id);
  const isOwnerOrAdmin =
    currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";

  const getInitials = (member: TeamMember ) => {
    if (!member.user) return "NA";
    return `${member.user.name.charAt(0)}${member.user.paternalSurname.charAt(0)}`.toUpperCase();
  };

  const displayMembers = teamMembers.slice(0, 3);
  const remainingMembersCount = teamMembers.length - 3;

  // Acciones de equipo mudadas desde index.tsx
  const handleDeleteTeam = async () => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este equipo? Esta acción es irreversible."
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/team/${teamId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar el equipo");

      alert("Equipo eliminado exitosamente");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error eliminando el equipo:", error);
      alert("Hubo un problema al intentar eliminar el equipo.");
    }
  };

  const handleLeaveTeam = async () => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas salir de este equipo?"
    );
    if (!isConfirmed) return;
    try {
      const token = localStorage.getItem("token");

      const teamMember = teamMembers.find((m) => m.userId === Number(user?.id));
      if (!teamMember) {
        throw new Error("No se encontró tu membresía en el equipo");
      }

      const response = await fetch(`${API_BASE_URL}/team-members/leaveteam`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(user?.id),
          teamId: Number(teamId),
        }),
      });
      if (!response.ok) throw new Error(`Error al salir del equipo:`);

      alert("Has salido del equipo exitosamente");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al salir del equipo:", error);
      alert("Hubo un problema al intentar salir del equipo.");
    }
  };

  return (
    <>
      <header className="flex flex-col gap-4 border-b bg-white px-6 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {teamData?.name || "Equipo"}
            </h1>
            <p className="flex items-center text-sm text-gray-500">
              <Users className="mr-1 h-4 w-4" /> Tablero de equipo
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 md:justify-end">
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {displayMembers.map((member) => (
                <Avatar
                  key={member.id}
                  className="h-10 w-10 border-2 border-white"
                >
                  <AvatarFallback className="bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {getInitials(member)}
                  </AvatarFallback>
                </Avatar>
              ))}

              {remainingMembersCount > 0 && (
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarFallback className="bg-gray-100 text-sm font-semibold text-gray-700">
                    +{remainingMembersCount}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 rounded-full"
                >
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  Miembros del equipo ({teamMembers.length})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {teamMembers.map((member) => (
                  <DropdownMenuItem
                    key={member.id}
                    className="flex items-center gap-3 py-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-50 text-xs font-semibold text-blue-700">
                        {getInitials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {member.user
                          ? `${member.user.name} ${member.user.paternalSurname}`
                          : `ID: ${member.id}`}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {member.role}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                {isOwnerOrAdmin ? (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        setIsSettingsOpen(true);
                      }}
                    >
                      <LucideTableConfig className="mr-2 h-4 w-4" />
                      <span className="font-semibold">
                        Configuración del equipo
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleDeleteTeam}
                      className="cursor-pointer py-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="font-semibold">Eliminar Equipo</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={handleLeaveTeam}
                    className="cursor-pointer py-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-semibold">Salir del Equipo</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* El diálogo de configuraciones ahora recibe los datos limpios directamente */}
      <TeamSettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        teamId={Number(teamId)}
        members={teamMembers}
        currentUserRole={currentMember?.role}
      />
    </>
  );
};