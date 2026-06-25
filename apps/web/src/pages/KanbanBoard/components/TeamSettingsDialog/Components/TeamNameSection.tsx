
import { PencilLine } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { useTeamSettingsStore } from "../useTeamSettingsStore";

interface TeamNameSectionProps {
  originalName: string;
}

export const TeamNameSection = ({ originalName }: TeamNameSectionProps) => {
  const draftName = useTeamSettingsStore((s) => s.draftName);
  const setDraftName = useTeamSettingsStore((s) => s.setDraftName);
  const isLoading = useTeamSettingsStore((s) => s.isLoading);
  const isSaving = useTeamSettingsStore((s) => s.isSaving);

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900">
        <PencilLine className="h-4 w-4 text-gray-500" />
        Nombre del equipo
      </h4>
      <Input
        type="text"
        placeholder={originalName}
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        className="bg-white"
        disabled={isLoading || isSaving}
      />
    </div>
  );
};
