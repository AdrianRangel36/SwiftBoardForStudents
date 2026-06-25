
import { UserPlus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useTeamSettingsStore } from "../useTeamSettingsStore";

interface InviteMemberSectionProps {
  onInvite: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
}

export const InviteMemberSection = ({ onInvite }: InviteMemberSectionProps) => {
  const inviteEmail = useTeamSettingsStore((s) => s.inviteEmail);
  const setInviteEmail = useTeamSettingsStore((s) => s.setInviteEmail);
  const isLoading = useTeamSettingsStore((s) => s.isLoading);
  const isSaving = useTeamSettingsStore((s) => s.isSaving);

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900">
        <UserPlus className="h-4 w-4 text-gray-500" />
        Invitar nuevo miembro
      </h4>
      <form onSubmit={onInvite} className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="correo@estudiante.edu"
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
  );
};
