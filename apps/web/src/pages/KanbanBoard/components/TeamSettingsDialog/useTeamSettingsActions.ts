
import { useShallow } from "zustand/react/shallow";
import type { TeamMember } from "@/interfaces";
import {
  useTeamSettingsStore,
  selectHasNameChanged,
  selectRolesToUpdate,
  selectHasUnsavedChanges,
} from "./useTeamSettingsStore";
import { teamSettingsService } from "./teamSettingsService";
import { useKanbanStore } from "../../useKanbanStore";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

interface UseTeamSettingsActionsParams {
  teamId: number;
  teamName: string;
  members: TeamMember[];
  onOpenChange: (open: boolean) => void;
}

export interface TeamSettingsActionsReturn {
  hasUnsavedChanges: boolean;
  handleOpenChangeInterception: (newOpen: boolean) => void;
  handleSaveChanges: () => Promise<void>;
  handleInvite: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook — Responsabilidad única: orquestar lógica de negocio
// No renderiza nada, no conoce detalles de UI
// ─────────────────────────────────────────────────────────────────────────────

export const useTeamSettingsActions = ({
  teamId,
  teamName,
  members,
  onOpenChange,
}: UseTeamSettingsActionsParams): TeamSettingsActionsReturn => {
  // Selección con shallow para evitar re-renders innecesarios
  const {
    draftName,
    draftRoles,
    draftDeletions,
    inviteEmail,
    setIsLoading,
    setIsSaving,
    setInviteEmail,
  } = useTeamSettingsStore(
    useShallow((s) => ({
      draftName: s.draftName,
      draftRoles: s.draftRoles,
      draftDeletions: s.draftDeletions,
      inviteEmail: s.inviteEmail,
      setIsLoading: s.setIsLoading,
      setIsSaving: s.setIsSaving,
      setInviteEmail: s.setInviteEmail,
    }))
  );

  const refetchTeamData = useKanbanStore((s) => s.refetchTeamData);
  const setStoreTeamName = useKanbanStore((s) => s.setTeamName);

  const token = localStorage.getItem("token") ?? "";

  // ── Valores derivados (derived state) ──────────────────────────────────────
  const hasNameChanged = selectHasNameChanged(draftName, teamName);
  const rolesToUpdate = selectRolesToUpdate(draftRoles, draftDeletions, members);
  const hasUnsavedChanges = selectHasUnsavedChanges(
    draftName,
    draftRoles,
    draftDeletions,
    teamName,
    members
  );

  // ── Interceptar cierre del Dialog ──────────────────────────────────────────
  const handleOpenChangeInterception = (newOpen: boolean): void => {
    if (!newOpen && hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar y descartar los cambios?"
      );
      if (!confirmed) return;
    }
    onOpenChange(newOpen);
  };

  // ── Guardado batch de todos los cambios ────────────────────────────────────
  const handleSaveChanges = async (): Promise<void> => {
    if (!hasUnsavedChanges) {
      onOpenChange(false);
      return;
    }

    try {
      setIsSaving(true);
      const promises: Promise<void>[] = [];

      if (hasNameChanged) {
        promises.push(
          teamSettingsService.updateTeamName(teamId, draftName, token)
        );
      }

      rolesToUpdate.forEach((member) => {
        promises.push(
          teamSettingsService.changeMemberRole({
            teamId,
            userId: member.userId,
            memberId: member.id,
            role: draftRoles[member.userId],
            token,
          })
        );
      });

      draftDeletions.forEach((userId) => {
        promises.push(
          teamSettingsService.removeMember(teamId, userId, token)
        );
      });

      await Promise.all(promises);

      if (hasNameChanged) setStoreTeamName(draftName);

      await refetchTeamData();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert(
        "Hubo un error al aplicar algunos de los cambios. Por favor, revisa e inténtalo de nuevo."
      );
      await refetchTeamData();
    } finally {
      setIsSaving(false);
    }
  };

  // ── Invitación inmediata ───────────────────────────────────────────────────
  const handleInvite = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!inviteEmail || !teamId) return;

    try {
      setIsLoading(true);
      const user = await teamSettingsService.findUserByEmail(inviteEmail, token);
      await teamSettingsService.inviteMember(teamId, user.id, token);

      setInviteEmail("");
      await refetchTeamData();
      alert("Usuario invitado exitosamente");
    } catch (error) {
      console.error("Error al invitar usuario:", error);
      alert("No se pudo invitar al usuario. Verifica el correo.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasUnsavedChanges,
    handleOpenChangeInterception,
    handleSaveChanges,
    handleInvite,
  };
};
