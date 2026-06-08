import { useEffect, useState, useRef } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { KanbanHeader, KanbanColumn, CreateTaskForm } from "./components";
import type { Task, TeamData, TeamMember } from "./types";
import { KANBAN_COLUMNS } from "./types";
import type { UserData } from "../Dashboard/types";

const API_BASE_URL = import.meta.env.VITE_API_URL;
export const KanbanBoard = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const teamData = useOutletContext<TeamData>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetchTeamTasks();
    fetchTeamMembers();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, [teamId]);

  const fetchTeamTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/tasks/team-tasks/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        console.error(
          `Error fetching tasks: ${response.status} ${response.statusText}`
        );
        setTasks([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.warn("Empty response from server");
        setTasks([]);
        return;
      }

      const data = JSON.parse(text);
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/team-members/findallteam/${teamId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        console.error(
          `Error fetching members: ${response.status} ${response.statusText}`
        );
        setTeamMembers([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.warn("Empty response from server");
        setTeamMembers([]);
        return;
      }

      const allMembers: TeamMember[] = JSON.parse(text);
      if (Array.isArray(allMembers)) {
        const membersOfThisTeam = allMembers.filter(
          (m) => m.teamId === Number(teamId)
        );
        setTeamMembers(membersOfThisTeam);
      } else {
        console.warn("Unexpected response format for team members");
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDeleteTask = async (taskId: number) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta tarea? Esta acción es irreversible."
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar la tarea");

      fetchTeamTasks();

      if (taskToEdit && taskToEdit.id === taskId) {
        setTaskToEdit(null);
      }
    } catch (error) {
      console.error("Error eliminando la tarea:", error);
      alert("Hubo un problema al intentar eliminar la tarea.");
    }
  };

  const handleDeleteTeam = async () => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este equipo? Esta acción es irreversible."
    );
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/team/${teamId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar el equipo");

      alert("Equipo eliminado exitosamente");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error eliminando el equipo:", error);
      alert("Hubo un problema al intentar eliminar el equipo.");
    }
  };

  const handleLeaveTeam = async () => {
    //reutilizar función en el futuro para que OWNER elimine miembros
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas salir de este equipo?"
    );
    if (!isConfirmed) return;
    try {
      const token = localStorage.getItem("token");

      const teamMember = teamMembers.find((m) => m.userId === Number(user?.id));
      if (!teamMember) {
        throw new Error("No se encontró tu membresía en el equipo");
      }

      const response = await fetch(`${API_BASE_URL}/team-members/leaveteam`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(user?.id),
          teamId: Number(teamId),
        }),
      });
      if (!response.ok) throw new Error(`Error al salir del equipo:`);

      alert("Has salido del equipo exitosamente");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error al salir del equipo:", error);
      alert("Hubo un problema al intentar salir del equipo.");
    }
  };

  const handleUpdateTeam = async () => {
    const newTeamName = prompt(
      "Ingresa el nuevo nombre del equipo:",
      teamData?.name
    );
    if (!newTeamName || newTeamName.trim() === "") return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/team/${teamId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTeamName.trim() }),
      });

      if (!response.ok) throw new Error("Error al actualizar el equipo");

      alert("Equipo actualizado exitosamente");
      window.location.reload();
    } catch (error) {
      console.error("Error actualizando el equipo:", error);
      alert("Hubo un problema al intentar actualizar el equipo.");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Exigimos mover el mouse 5px para arrastrar
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Si la soltó fuera de una columna válida
    if (!over) return;

    const taskId = Number(active.id);
    const newStatus = over.id as Task["status"];

    const task = tasks.find((t) => t.id === taskId);
    // Si la tarea se soltó en la misma columna donde estaba, ignoramos
    if (!task || task.status === newStatus) return;

    // ACTUALIZACIÓN OPTIMISTA (La UI cambia al instante)
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    // PETICIÓN PUT AL BACKEND
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Error al mover la tarea en la BD");
    } catch (error) {
      console.error("Error moviendo tarea:", error);
      // Revertir UI si falla el servidor
      fetchTeamTasks();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <KanbanHeader
        teamName={teamData?.name || "Equipo"}
        teamMembers={teamMembers}
        onDeleteTeam={handleDeleteTeam}
        onLeaveTeam={handleLeaveTeam}
        onUpdateTeam={handleUpdateTeam}
      />
      <main className="flex flex-1 flex-col p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="animate-pulse text-gray-500">Cargando tablero...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {KANBAN_COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  tasks={getTasksByStatus(col.id)}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  members={teamMembers}
                />
              ))}
            </div>
          </DndContext>
        )}

        <div ref={formRef}>
          <CreateTaskForm
            teamId={teamId}
            teamMembers={teamMembers}
            onTaskCreated={fetchTeamTasks}
            taskToEdit={taskToEdit}
            onCancelEdit={() => setTaskToEdit(null)}
          />
        </div>
      </main>
    </div>
  );
};
