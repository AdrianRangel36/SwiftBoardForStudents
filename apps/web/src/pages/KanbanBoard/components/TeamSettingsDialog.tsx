import { useState } from "react";
import { UserPlus, Shield, ShieldAlert, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { TeamMember } from "@/interfaces";
import { useKanbanStore } from "../useKanbanStore";

const API_BASE_URL = import.meta.env.VITE_API_URL;
interface TeamSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: number;
  members: TeamMember[];
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | "PENDING" | undefined;
}

export const TeamSettingsDialog = ({
  isOpen,
  onOpenChange,
  members,
  currentUserRole,
}: TeamSettingsDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const teamId = useKanbanStore((state) => state.teamId);
  const canManageTeam =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const handleInvite = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!inviteEmail || !teamId) return;
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const responseUsers = await fetch(
        `${API_BASE_URL}/users/search/${inviteEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!responseUsers.ok) throw new Error(`El Usuario no existe`);
      const data = await responseUsers.json();
      const inviteId = data.id;
      const responseTeam = await fetch(`${API_BASE_URL}/team-members/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(inviteId),
          teamId: Number(teamId),
          role: "PENDING",
        }),
      });

      if (!responseTeam.ok) throw new Error(`Error al invitar miembro`);
      setInviteEmail("");
    } catch (error) {
      console.error("Error al invitar usuario", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (memberId: number, newRole: string) => {
    try {
      console.log(`Cambiando rol del miembro ${memberId} a ${newRole}`);
    } catch (error) {
      console.error("Error al actualizar rol", error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      console.log(`Eliminando miembro ${memberId}`);
    } catch (error) {
      console.error("Error al eliminar miembro", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuración del Equipo</DialogTitle>
          <DialogDescription>
            Administra los miembros de tu equipo, asigna roles y envía nuevas
            invitaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {canManageTeam && (
            <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <UserPlus className="h-4 w-4" /> Invitar nuevo miembro
              </h4>
              <form onSubmit={handleInvite} className="flex items-center gap-3">
                <Input
                  placeholder="correo@estudiante.edu"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-white"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !inviteEmail}>
                  Invitar
                </Button>
              </form>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">
              Miembros actuales
            </h4>
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {member.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {member.user?.name} {member.user?.paternalSurname}
                      </span>
                      <span className="text-xs text-gray-500">
                        {member.role === "OWNER"
                          ? "Propietario"
                          : member.role === "ADMIN"
                            ? "Administrador"
                            : "Miembro"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      defaultValue={member.role}
                      onValueChange={(val) => handleChangeRole(member.id, val)}
                      disabled={!canManageTeam || member.role === "OWNER"}
                    >
                      <SelectTrigger className="h-8 w-30 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN" className="text-xs">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-3 w-3 text-orange-500" />{" "}
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="MEMBER" className="text-xs">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-slate-400" />{" "}
                            Miembro
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {canManageTeam && member.role !== "OWNER" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
