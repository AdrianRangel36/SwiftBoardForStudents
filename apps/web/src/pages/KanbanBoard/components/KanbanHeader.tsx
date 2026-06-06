import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface KanbanHeaderProps {
  teamName: string;
}

export const KanbanHeader = ({ teamName }: KanbanHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col gap-4 border-b bg-white px-6 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{teamName || "Equipo"}</h1>
          <p className="flex items-center text-sm text-gray-500">
            <Users className="mr-1 h-4 w-4" /> Tablero de equipo
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 md:justify-end">
        <Button variant="destructive" className="shadow-sm">
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar Equipo
        </Button>
      </div>
    </header>
  );
};
