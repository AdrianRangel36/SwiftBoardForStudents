
import { Button } from "@workspace/ui/components/button";
import { DialogFooter } from "@workspace/ui/components/dialog";

interface TeamSettingsFooterProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => Promise<void>;
}

export const TeamSettingsFooter = ({
  hasUnsavedChanges,
  isSaving,
  onCancel,
  onSave,
}: TeamSettingsFooterProps) => (
  <DialogFooter className="mt-4 flex flex-col-reverse items-center gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
    {/* Indicador de cambios pendientes */}
    {hasUnsavedChanges ? (
      <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600 sm:mr-auto">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        Tienes cambios sin aplicar
      </span>
    ) : (
      <span />
    )}

    {/* Botones de acción */}
    <div className="flex w-full gap-2 sm:w-auto">
      <Button
        className="w-full sm:w-auto"
        variant="outline"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancelar
      </Button>
      <Button
        className="w-full sm:w-auto"
        onClick={onSave}
        disabled={isSaving || !hasUnsavedChanges}
      >
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  </DialogFooter>
);
