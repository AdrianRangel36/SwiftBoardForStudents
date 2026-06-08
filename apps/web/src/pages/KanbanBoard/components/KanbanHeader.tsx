import { useNavigate } from "react-router-dom";
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
import type { TeamMember } from "../types";

interface KanbanHeaderProps {
  teamName: string;
  teamMembers: TeamMember[];
  onDeleteTeam?: () => void;
  onLeaveTeam?: () => void;
  onUpdateTeam?: () => void;
}

export const KanbanHeader = ({
  teamName,
  teamMembers = [],
  onDeleteTeam,
  onLeaveTeam,
  onUpdateTeam,
}: KanbanHeaderProps) => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentMember = teamMembers.find((m) => m.userId === currentUser?.id);
  const isOwner = currentMember?.role === "OWNER";
  const getInitials = (member: TeamMember) => {
    if (!member.user) return "NA";
    return `${member.user.name.charAt(0)}${member.user.paternalSurname.charAt(0)}`.toUpperCase();
  };

  const displayMembers = teamMembers.slice(0, 3);
  const remainingMembersCount = teamMembers.length - 3;

  return (
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
            {teamName || "Equipo"}
          </h1>
          <p className="flex items-center text-sm text-gray-500">
            <Users className="mr-1 h-4 w-4" /> Tablero de equipo
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 md:justify-end">
        {/* SECCIÓN DE USUARIOS Y MENÚ */}
        <div className="flex items-center">
          {/* Grupo de Avatares superpuestos (-space-x-3) */}
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

            {/* Burbuja extra si hay más de 3 miembros */}
            {remainingMembersCount > 0 && (
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarFallback className="bg-gray-100 text-sm font-semibold text-gray-700">
                  +{remainingMembersCount}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Menú Desplegable de Miembros y Acciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 rounded-full">
                <ChevronDown className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                Miembros del equipo ({teamMembers.length})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Lista dinámica de miembros */}
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

              {/* Renderizado Condicional del Botón Peligroso */}
              {isOwner ? (
                <>
                  <DropdownMenuItem
                    onClick={onUpdateTeam}
                    className="cursor-pointer"
                  >
                    <LucideTableConfig className="mr-2 h-4 w-4" />
                    <span className="font-semibold">
                      Configuración del equipo
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={onDeleteTeam}
                    className="cursor-pointer py-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="font-semibold">Eliminar Equipo</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={onLeaveTeam}
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
  );
};
