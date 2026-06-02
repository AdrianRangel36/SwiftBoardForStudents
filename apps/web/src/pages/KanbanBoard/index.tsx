import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";

interface Task {
  id: number;
  assignedMemberId: number;
  teamId: number;
  status: 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  name: string;
  description: string;
  goals: string;
  startDate: string;
  endDate: string;
}

interface TeamData {
  id: number;
  name: string;
  description?: string;
  [key: string]: any;
}

const KANBAN_COLUMNS = [
  { id: 'TO_DO', title: 'Por Hacer', color: 'bg-slate-200 border-slate-300' },
  { id: 'IN_PROGRESS', title: 'En Progreso', color: 'bg-blue-100 border-blue-200' },
  { id: 'IN_REVIEW', title: 'En Revisión', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'DONE', title: 'Completado', color: 'bg-green-100 border-green-200' }
] as const;

export const KanbanBoard = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const teamData = useOutletContext<TeamData>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamTasks();
  }, [teamId]);

  const fetchTeamTasks = async () => {
    // ... (tu lógica de fetch actual se mantiene igual)
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/tasks/team-tasks/${teamId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Error obteniendo tareas");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* HEADER DEL TABLERO */}
      <header className="flex flex-col gap-4 border-b bg-white px-6 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-gray-100 hover:bg-gray-200">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{teamData?.name || "Equipo"}</h1>
            <p className="flex items-center text-sm text-gray-500">
              <Users className="mr-1 h-4 w-4" /> Tablero de equipo
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 md:justify-end">
          {/* Sección visual de Miembros (Avatar Group) */}
          <div className="flex items-center">
            <div className="flex -space-x-3">
              <Avatar className="h-10 w-10 border-2 border-white"><AvatarFallback className="bg-blue-200">AR</AvatarFallback></Avatar>
              <Avatar className="h-10 w-10 border-2 border-white"><AvatarFallback className="bg-indigo-200">JD</AvatarFallback></Avatar>
              <Avatar className="h-10 w-10 border-2 border-white"><AvatarFallback className="bg-emerald-200">LM</AvatarFallback></Avatar>
            </div>
            <div className="ml-3 text-sm font-medium text-gray-600">3 miembros</div>
          </div>

          {/* Botón de acción principal del equipo */}
          <Button variant="destructive" className="shadow-sm">
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Equipo
          </Button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL Y COLUMNAS */}
      <main className="flex flex-1 flex-col p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="animate-pulse text-gray-500">Cargando tablero...</p>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col.id} className="flex h-[55vh] flex-col rounded-xl border border-gray-200 bg-gray-100/50 p-4 lg:h-auto lg:min-h-[500px]">
                
                {/* Encabezado de la columna con estilo refinado */}
                <div className={`mb-4 flex items-center justify-between rounded-lg border px-3 py-2 ${col.color}`}>
                  <h3 className="font-semibold text-gray-800">{col.title}</h3>
                  <Badge variant="secondary" className="bg-white text-gray-700 shadow-sm">
                    {getTasksByStatus(col.id).length}
                  </Badge>
                </div>

                <ScrollArea className="flex-1 pr-3">
                  <div className="flex flex-col gap-3">
                    {getTasksByStatus(col.id).map((task) => (
                      <Card key={task.id} className="cursor-grab border-gray-200 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-bold text-gray-800">{task.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="mb-3 line-clamp-2 text-xs text-gray-500">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-gray-50 text-[10px] text-gray-600">
                              {new Date(task.endDate).toLocaleDateString()}
                            </Badge>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-slate-200 text-[10px] font-bold text-slate-700">
                                {task.assignedMemberId}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>
        )}

        {/* SECCIÓN INFERIOR: CREACIÓN RÁPIDA DE TAREAS */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Agregar nueva tarea</h3>
          <form className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-2">
              <Label htmlFor="taskName">Título de la tarea</Label>
              <Input id="taskName" placeholder="Ej. Diseñar la pantalla de login..." />
            </div>
            
            <div className="flex-1 space-y-2">
              <Label htmlFor="taskDesc">Descripción breve</Label>
              <Textarea id="taskDesc" placeholder="Detalles de lo que se debe hacer..." className="min-h-10 resize-none" />
            </div>

            <div className="flex w-full flex-col justify-end gap-2 lg:w-auto lg:pt-6">
              <Button type="button" className="w-full lg:w-40">
                Añadir Tarea
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};