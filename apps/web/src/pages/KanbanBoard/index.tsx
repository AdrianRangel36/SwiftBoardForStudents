import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Trash2, Users, Loader2, Calendar as CalendarIcon } from "lucide-react";
// Importaciones de utilidades para fechas
import { format } from "date-fns";
import { es } from "date-fns/locale"; 
import { cn } from "@workspace/ui/lib/utils";

import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Calendar } from "@workspace/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";

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
}

// Interfaz para los miembros del equipo basados en tu backend
interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  // Si tu backend hace un "include: { user: true }", vendría esto:
  user?: { name: string; paternalSurname: string }; 
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados del Formulario Completo
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskGoals, setNewTaskGoals] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('TO_DO');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [newTaskStartDate, setNewTaskStartDate] = useState<Date>();
  const [newTaskEndDate, setNewTaskEndDate] = useState<Date>();
  
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTeamTasks();
    fetchTeamMembers();
  }, [teamId]);

  const fetchTeamTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/tasks/team-tasks/${teamId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) setTasks(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/team-members`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const allMembers: TeamMember[] = await response.json();
        // Filtramos para solo tener los miembros de ESTE equipo
        const membersOfThisTeam = allMembers.filter(m => m.teamId === Number(teamId));
        setTeamMembers(membersOfThisTeam);
      }
    } catch (error) {
      console.error("Error obteniendo miembros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación básica en frontend
    if (!newTaskName || !newTaskDesc || !newTaskGoals || !newTaskAssignee || !newTaskStartDate || !newTaskEndDate) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newTaskName,
          description: newTaskDesc,
          goals: newTaskGoals,
          status: newTaskStatus,
          teamId: Number(teamId),
          assignedMemberId: Number(newTaskAssignee), // Enviamos el ID de la tabla pivote
          startDate: newTaskStartDate.toISOString(), // Convertimos Date a formato ISO que espera Prisma
          endDate: newTaskEndDate.toISOString(),
        })
      });

      if (!response.ok) throw new Error("Error al crear la tarea");

      // Limpieza de formulario
      setNewTaskName("");
      setNewTaskDesc("");
      setNewTaskGoals("");
      setNewTaskStatus("TO_DO");
      setNewTaskAssignee("");
      setNewTaskStartDate(undefined);
      setNewTaskEndDate(undefined);
      
      fetchTeamTasks();
      
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Hubo un conflicto al crear la tarea. Revisa los datos.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ... (Header y listado de Columnas igual que antes) ... */}
      <header className="flex flex-col gap-4 border-b bg-white px-6 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
         {/* ... (Mismo código de header) ... */}
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
          <Button variant="destructive" className="shadow-sm">
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Equipo
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="animate-pulse text-gray-500">Cargando tablero...</p>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col.id} className="flex h-[55vh] flex-col rounded-xl border border-gray-200 bg-gray-100/50 p-4 lg:h-auto lg:min-h-125">
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>
        )}

        {/* SECCIÓN INFERIOR: FORMULARIO COMPLETO DE TAREAS */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 border-b pb-2 text-lg font-bold text-gray-900">Agregar nueva tarea</h3>
          
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            
            {/* Fila 1: Título y Descripción */}
            <div className="space-y-2 lg:col-span-4">
              <Label htmlFor="taskName">Título de la tarea</Label>
              <Input id="taskName" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} required />
            </div>
            <div className="space-y-2 lg:col-span-8">
              <Label htmlFor="taskDesc">Descripción</Label>
              <Input id="taskDesc" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} required />
            </div>

            {/* Fila 2: Objetivos (Textarea largo) */}
            <div className="space-y-2 lg:col-span-12">
              <Label htmlFor="taskGoals">Objetivos / Entregables</Label>
              <Textarea id="taskGoals" className="min-h-15" value={newTaskGoals} onChange={(e) => setNewTaskGoals(e.target.value)} required />
            </div>

            {/* Fila 3: Asignado, Columna, Fechas */}
            <div className="space-y-2 lg:col-span-3">
              <Label>Asignar a</Label>
              <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                <SelectTrigger><SelectValue placeholder="Seleccionar miembro" /></SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {/* Ojo: Si el backend no envía el nombre del user, temporalmente mostraremos el ID */}
                      {member.user ? `${member.user.name}` : `Miembro ID: ${member.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label>Estado inicial</Label>
              <Select value={newTaskStatus} onValueChange={(val: Task['status']) => setNewTaskStatus(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Fecha de Inicio */}
            <div className="space-y-2 flex flex-col justify-end lg:col-span-2">
              <Label>Fecha Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newTaskStartDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskStartDate ? format(newTaskStartDate, "PPP", { locale: es }) : <span>Seleccionar</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={newTaskStartDate} onSelect={setNewTaskStartDate} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Selector de Fecha de Fin */}
            <div className="space-y-2 flex flex-col justify-end lg:col-span-2">
              <Label>Fecha Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newTaskEndDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskEndDate ? format(newTaskEndDate, "PPP", { locale: es }) : <span>Seleccionar</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={newTaskEndDate} onSelect={setNewTaskEndDate} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Botón Guardar */}
            <div className="flex flex-col justify-end lg:col-span-2">
              <Button type="submit" disabled={isCreating} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear Tarea"}
              </Button>
            </div>
            
          </form>
        </div>
      </main>
    </div>
  );
};