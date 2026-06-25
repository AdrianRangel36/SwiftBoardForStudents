
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import type { TeamMember } from "@/interfaces";
import { useTeamSettingsStore } from "./useTeamSettingsStore";
import { useTeamSettingsActions } from "./useTeamSettingsActions";
import { InviteMemberSection, MemberList, TeamNameSection, TeamSettingsFooter } from "./Components";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TeamSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: number;
  teamName: string;
  members: TeamMember[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente — Responsabilidad única: orquestar los sub-componentes.
// No contiene lógica de negocio ni llamadas HTTP.
// ─────────────────────────────────────────────────────────────────────────────

export const TeamSettingsDialog = ({
  isOpen,
  onOpenChange,
  teamId,
  teamName,
  members,
}: TeamSettingsDialogProps) => {
  const initializeDraft = useTeamSettingsStore((s) => s.initializeDraft);
  const isSaving = useTeamSettingsStore((s) => s.isSaving);

  const {
    hasUnsavedChanges,
    handleOpenChangeInterception,
    handleSaveChanges,
    handleInvite,
  } = useTeamSettingsActions({ teamId, teamName, members, onOpenChange });

  // Hidratar el draft state cada vez que el dialog se abre
  useEffect(() => {
    if (isOpen) {
      initializeDraft(teamName, members);
    }
  }, [isOpen, teamName, members, initializeDraft]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChangeInterception}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col md:min-w-xl">
        <DialogHeader>
          <DialogTitle>Configuración del Equipo</DialogTitle>
          <DialogDescription>
            Administra los miembros de tu equipo, asigna roles y envía nuevas
            invitaciones.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 overflow-hidden py-4 md:grid-cols-2">
          {/* Columna izquierda */}
          <div className="flex flex-col gap-6">
            <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50/50 p-5">
              <TeamNameSection originalName={teamName} />
              <div className="h-px w-full bg-gray-200" />
              <InviteMemberSection onInvite={handleInvite} />
            </div>
          </div>

          {/* Columna derecha */}
          <MemberList members={members} />
        </div>

        <TeamSettingsFooter
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onCancel={() => handleOpenChangeInterception(false)}
          onSave={handleSaveChanges}
        />
      </DialogContent>
    </Dialog>
  );
};
