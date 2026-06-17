import { useState, useEffect } from "react";
import {
  UserPlus,
  Shield,
  ShieldAlert,
  Trash2,
  PencilLine,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface TeamSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: number;
  teamName: string;
  members: TeamMember[];
  onTeamUpdated: () => void;
}

export const TeamSettingsDialog = ({
  isOpen,
  onOpenChange,
  members,
  teamId,
  teamName,
  onTeamUpdated,
}: TeamSettingsDialogProps) => {
  // --- Estados de Acciones Inmediatas (Invites) ---
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  // --- Estados Borrador (Draft State) ---
  const [draftName, setDraftName] = useState(teamName);
  const [draftRoles, setDraftRoles] = useState<Record<number, string>>({});
  const [draftDeletions, setDraftDeletions] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // 1. Hidratación del Draft State al abrir el dialog
  useEffect(() => {
    if (isOpen) {
      setDraftName(teamName);

      const initialRoles: Record<number, string> = {};
      members.forEach((m) => {
        initialRoles[m.id] = m.role;
      });
      setDraftRoles(initialRoles);

      setDraftDeletions(new Set());
      setInviteEmail("");
    }
  }, [isOpen, teamName, members]);

  // 2. Dirty Checking: Derivamos qué ha cambiado
  const hasNameChanged = draftName.trim() !== "" && draftName !== teamName;

  const rolesToUpdate = members.filter(
    (m) =>
      draftRoles[m.id] &&
      draftRoles[m.id] !== m.role &&
      !draftDeletions.has(m.id)
  );

  const hasPendingDeletions = draftDeletions.size > 0;
  const hasUnsavedChanges =
    hasNameChanged || rolesToUpdate.length > 0 || hasPendingDeletions;

  // 3. Interceptar cierre del Dialog
  const handleOpenChangeInterception = (newOpen: boolean) => {
    if (!newOpen && hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar y descartar los cambios?"
      );
      if (!confirmClose) return; // Aborta el cierre
    }
    onOpenChange(newOpen);
  };

  // 4. Batch de Guardado (Se ejecutan todos los cambios juntos)
  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges) {
      onOpenChange(false);
      return;
    }

    try {
      setIsSaving(true);
      const promises: Promise<Response>[] = [];

      // A. Promesa: Cambio de Nombre
      if (hasNameChanged) {
        promises.push(
          fetch(`${API_BASE_URL}/team/${teamId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: draftName }),
          }).then((res) => {
            if (!res.ok) throw new Error("Error cambiando el nombre");
            return res;
          })
        );
      }

      // B. Promesas: Cambio de Roles
      rolesToUpdate.forEach((member) => {
        promises.push(
          fetch(`${API_BASE_URL}/team-members/changerole`, {
            method: "PUT",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: member.user?.id,
              teamId: teamId,
              role: draftRoles[member.id],
            }),
          }).then((res) => {
            if (!res.ok)
              throw new Error(
                `Error cambiando el rol del miembro ${member.id}`
              );
            return res;
          })
        );
      });

      // C. Promesas: Eliminar Miembros
      draftDeletions.forEach((memberId) => {
        promises.push(
          fetch(`${API_BASE_URL}/team-members/leaveteam`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: memberId,
              teamId: teamId,
            }),
          }).then((res) => {
            if (!res.ok)
              throw new Error(`Error al eliminar al miembro ${memberId}`);
            return res;
          })
        );
      });

      // Ejecutar todo en paralelo
      await Promise.all(promises);

      // Si todo sale bien, recargamos UI y cerramos
      onTeamUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar los cambios", error);
      alert(
        "Hubo un error al aplicar algunos de los cambios. Por favor, revisa e inténtalo de nuevo."
      );
      // Recargamos el estado para que muestre la realidad de la DB después de fallar
      onTeamUpdated();
    } finally {
      setIsSaving(false);
    }
  };

  // 5. La invitación se mantiene inmediata por su dependencia del correo
  const handleInvite = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteEmail || !teamId) return;
    try {
      setIsLoading(true);
      const responseUsers = await fetch(
        `${API_BASE_URL}/users/search/${inviteEmail}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
      onTeamUpdated();
      alert("Usuario invitado exitosamente");
    } catch (error) {
      console.error("Error al invitar usuario", error);
      alert("No se pudo invitar al usuario. Verifica el correo.");
    } finally {
      setIsLoading(false);
    }
  };

  const visibleMembers = members.filter((m) => !draftDeletions.has(m.id));

  return (
<Dialog open={isOpen} onOpenChange={handleOpenChangeInterception}>
      <DialogContent className="md:min-w-xl max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configuración del Equipo</DialogTitle>
          <DialogDescription>
            Administra los miembros de tu equipo, asigna roles y envía nuevas
            invitaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-hidden">
          
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-5 space-y-5">
              
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <PencilLine className="h-4 w-4 text-gray-500" /> Nombre del equipo
                </h4>
                <Input
                  type="text"
                  placeholder={teamName}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="bg-white"
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="h-px w-full bg-gray-200" />

              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <UserPlus className="h-4 w-4 text-gray-500" /> Invitar nuevo miembro
                </h4>
                <form onSubmit={handleInvite} className="flex items-center gap-2">
                  <Input
                    placeholder="correo@estudiante.edu"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 bg-white"
                    disabled={isLoading || isSaving}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || isSaving || !inviteEmail}
                  >
                    Invitar
                  </Button>
                </form>
              </div>

            </div>
          </div>

          {/* Columna Derecha: Lista de Miembros */}
          <div className="flex flex-col overflow-hidden">
            <h4 className="mb-3 text-sm font-medium text-gray-900">
              Miembros actuales
            </h4>
            
            {/* 5. Contenedor con Scroll: Altura fija máxima para no estirar el modal */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white max-h-[60vh] md:max-h-[320px] shadow-sm">
              <div className="divide-y divide-gray-100">
                {visibleMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                          {member.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {member.user?.name} {member.user?.paternalSurname}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {member.role === "OWNER"
                            ? "Propietario"
                            : draftRoles[member.id] === "ADMIN"
                              ? "Administrador"
                              : draftRoles[member.id] === "MEMBER"
                                ? "Miembro"
                                : member.role === "ADMIN"
                                  ? "Administrador"
                                  : "Miembro"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Select
                        value={draftRoles[member.id] || member.role}
                        onValueChange={(val) =>
                          setDraftRoles((prev) => ({ ...prev, [member.id]: val }))
                        }
                        disabled={member.role === "OWNER" || isSaving}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN" className="text-xs">
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="h-3 w-3 text-orange-500" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="MEMBER" className="text-xs">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3 text-slate-400" />
                              Miembro
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {member.role !== "OWNER" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          onClick={() =>
                            setDraftDeletions((prev) =>
                              new Set(prev).add(member.id)
                            )
                          }
                          disabled={isSaving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {visibleMembers.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                    <Shield className="h-8 w-8 text-gray-200" />
                    <span>No hay miembros visibles en el equipo.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-between border-t border-gray-100 pt-4">
          {hasUnsavedChanges ? (
            <span className="sm:mr-auto text-sm font-medium text-amber-600 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Tienes cambios sin aplicar
            </span>
          ) : (
            <span />
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={() => handleOpenChangeInterception(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSaveChanges}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
