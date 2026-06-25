
import { Shield, ShieldAlert, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { TeamMember } from "@/interfaces";
import { useTeamSettingsStore } from "../useTeamSettingsStore";

interface MemberListItemProps {
  member: TeamMember;
}

// ── Helpers puros (sin efectos secundarios) ────────────────────────────────

const getRoleLabel = (
  originalRole: string,
  draftRole: string | undefined
): string => {
  if (originalRole === "OWNER") return "Propietario";
  const isPendingChange = draftRole !== undefined && draftRole !== originalRole;
  if (isPendingChange) {
    const label = draftRole === "ADMIN" ? "Administrador" : "Miembro";
    return `${label} (Cambio pendiente)`;
  }
  return originalRole === "ADMIN" ? "Administrador" : "Miembro";
};

const getMemberInitial = (name?: string): string =>
  name?.charAt(0)?.toUpperCase() ?? "U";


export const MemberListItem = ({ member }: MemberListItemProps) => {
  const draftRoles = useTeamSettingsStore((s) => s.draftRoles);
  const setDraftRole = useTeamSettingsStore((s) => s.setDraftRole);
  const markForDeletion = useTeamSettingsStore((s) => s.markForDeletion);
  const isSaving = useTeamSettingsStore((s) => s.isSaving);

  const currentDraftRole = draftRoles[member.userId];
  const displayRole = currentDraftRole ?? member.role;
  const roleLabel = getRoleLabel(member.role, currentDraftRole);

  return (
    <div className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50/50">
      {/* Avatar + Info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-blue-100 font-medium text-blue-700">
            {getMemberInitial(member.user?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="max-w-30 truncate text-sm font-medium text-gray-900">
            {member.user?.name} {member.user?.paternalSurname}
          </span>
          <span className="text-[11px] text-gray-500">{roleLabel}</span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-1.5">
        <Select
          value={displayRole}
          onValueChange={(val) => setDraftRole(member.userId, val)}
          disabled={member.role === "OWNER" || isSaving}
        >
          <SelectTrigger className="h-8 w-28 bg-white text-xs">
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
            className="h-8 w-8 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={() => markForDeletion(member.userId)}
            disabled={isSaving}
            aria-label={`Eliminar a ${member.user?.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
