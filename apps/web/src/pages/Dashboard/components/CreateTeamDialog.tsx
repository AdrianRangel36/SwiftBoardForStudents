import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
  Card,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

interface CreateTeamDialogProps {
  onCreateTeam: (teamName: string) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({
  onCreateTeam,
  isOpen,
  onOpenChange,
}) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreateTeam(newTeamName);
      setNewTeamName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Card className="flex min-h-40 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-transparent hover:border-gray-400 hover:bg-gray-50">
          <Plus className="mb-2 h-8 w-8 text-gray-500" />
          <p className="font-medium text-gray-600">Crear tablero</p>
        </Card>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo equipo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del tablero/equipo</Label>
            <Input
              id="name"
              placeholder="Ej. Proyecto de Software"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
