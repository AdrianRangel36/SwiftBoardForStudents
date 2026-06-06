import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

import type { Task, TeamMember } from "../types";

interface CreateTaskFormProps {
  teamId: string | undefined;
  teamMembers: TeamMember[];
  onTaskCreated: () => void;
  taskToEdit?: Task | null;
  onCancelEdit?: () => void;
}

const KANBAN_COLUMNS = [
  { id: "TO_DO", title: "Por Hacer" },
  { id: "IN_PROGRESS", title: "En Progreso" },
  { id: "IN_REVIEW", title: "En Revisión" },
  { id: "DONE", title: "Completado" },
] as const;

export const CreateTaskForm = ({
  teamId,
  teamMembers,
  onTaskCreated,
  taskToEdit,
  onCancelEdit,
}: CreateTaskFormProps) => {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskGoals, setNewTaskGoals] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("TO_DO");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [newTaskStartDate, setNewTaskStartDate] = useState<Date>();
  const [newTaskEndDate, setNewTaskEndDate] = useState<Date>();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setNewTaskName(taskToEdit.name);
      setNewTaskDesc(taskToEdit.description);
      setNewTaskGoals(taskToEdit.goals);
      setNewTaskStatus(taskToEdit.status);
      setNewTaskAssignee(taskToEdit.assignedMemberId.toString());
      setNewTaskStartDate(new Date(taskToEdit.startDate));
      setNewTaskEndDate(new Date(taskToEdit.endDate));
    } else {
      resetForm();
    }
  }, [taskToEdit]);

  const resetForm = () => {
    setNewTaskName("");
    setNewTaskDesc("");
    setNewTaskGoals("");
    setNewTaskStatus("TO_DO");
    setNewTaskAssignee("");
    setNewTaskStartDate(undefined);
    setNewTaskEndDate(undefined);
  };

  const handleCreateTask = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (
      !newTaskName ||
      !newTaskDesc ||
      !newTaskGoals ||
      !newTaskAssignee ||
      !newTaskStartDate ||
      !newTaskEndDate
    ) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem("token");

      const url = taskToEdit
        ? `http://localhost:3000/tasks/${taskToEdit.id}`
        : "http://localhost:3000/tasks";

      const method = taskToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTaskName,
          description: newTaskDesc,
          goals: newTaskGoals,
          status: newTaskStatus,
          teamId: Number(teamId),
          assignedMemberId: Number(newTaskAssignee),
          startDate: newTaskStartDate.toISOString(),
          endDate: newTaskEndDate.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Error al guardar la tarea");

      resetForm();
      onTaskCreated();
      if (onCancelEdit) onCancelEdit();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Hubo un conflicto al guardar la tarea. Revisa los datos.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all">
      <div className="mb-4 flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-bold text-gray-900">
          {taskToEdit ? "Modificar Tarea" : "Agregar nueva tarea"}
        </h3>

        {taskToEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
            className="text-gray-500"
          >
            <X className="mr-2 h-4 w-4" /> Cancelar Edición
          </Button>
        )}
      </div>

      <form
        onSubmit={handleCreateTask}
        className="grid grid-cols-1 gap-4 lg:grid-cols-12"
      >
        <div className="space-y-2 lg:col-span-4">
          <Label htmlFor="taskName">Título de la tarea</Label>
          <Input
            id="taskName"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 lg:col-span-8">
          <Label htmlFor="taskDesc">Descripción</Label>
          <Input
            id="taskDesc"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 lg:col-span-12">
          <Label htmlFor="taskGoals">Objetivos / Entregables</Label>
          <Textarea
            id="taskGoals"
            className="min-h-15"
            value={newTaskGoals}
            onChange={(e) => setNewTaskGoals(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 lg:col-span-3">
          <Label>Asignar a</Label>
          <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar miembro" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id.toString()}>
                  {member.user
                    ? `${member.user.name}`
                    : `Miembro ID: ${member.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 lg:col-span-3">
          <Label>Estado inicial</Label>
          <Select
            value={newTaskStatus}
            onValueChange={(val: Task["status"]) => setNewTaskStatus(val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KANBAN_COLUMNS.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-end space-y-2 lg:col-span-2">
          <Label>Fecha Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newTaskStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newTaskStartDate ? (
                  format(newTaskStartDate, "PPP", { locale: es })
                ) : (
                  <span>Seleccionar</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newTaskStartDate}
                onSelect={setNewTaskStartDate}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col justify-end space-y-2 lg:col-span-2">
          <Label>Fecha Fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newTaskEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newTaskEndDate ? (
                  format(newTaskEndDate, "PPP", { locale: es })
                ) : (
                  <span>Seleccionar</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newTaskEndDate}
                onSelect={setNewTaskEndDate}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Botón Guardar modificado para cambiar de texto */}
        <div className="flex flex-col justify-end lg:col-span-2">
          <Button
            type="submit"
            disabled={isCreating}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : taskToEdit ? (
              "Guardar Cambios"
            ) : (
              "Crear Tarea"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
