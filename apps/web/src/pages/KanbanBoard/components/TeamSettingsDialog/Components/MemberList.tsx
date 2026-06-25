
import { useMemo } from "react";
import { Shield } from "lucide-react";
import type { TeamMember } from "@/interfaces";
import { useTeamSettingsStore, selectVisibleMembers } from "../useTeamSettingsStore";
import { MemberListItem } from "./MemberListItem";

interface MemberListProps {
  members: TeamMember[];
}

/**
 * Responsabilidad única: renderizar la lista scrolleable de miembros visibles.
 * Filtra los marcados para eliminar usando el selector puro del store.
 */
export const MemberList = ({ members }: MemberListProps) => {
  const draftDeletions = useTeamSettingsStore((s) => s.draftDeletions);

  const visibleMembers = useMemo(
    () => selectVisibleMembers(members, draftDeletions),
    [members, draftDeletions]
  );

  return (
    <div className="flex flex-col overflow-hidden">
      <h4 className="mb-3 text-sm font-medium text-gray-900">
        Miembros actuales
      </h4>

      <div className="max-h-[60vh] flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm md:max-h-80">
        <div className="divide-y divide-gray-100">
          {visibleMembers.map((member) => (
            <MemberListItem key={member.userId} member={member} />
          ))}

          {visibleMembers.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-gray-500">
              <Shield className="h-8 w-8 text-gray-200" />
              <span>No hay miembros visibles en el equipo.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
