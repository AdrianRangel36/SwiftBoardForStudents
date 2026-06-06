import { useEffect, useState, useRef } from "react";
import { useParams, useOutletContext } from "react-router-dom";

import { KanbanHeader, KanbanColumn, CreateTaskForm } from "./components";
import type { Task, TeamData, TeamMember } from "./types";
import { KANBAN_COLUMNS } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL;
export const KanbanBoard = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const teamData = useOutletContext<TeamData>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeamTasks();
    fetchTeamMembers();
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
      const response = await fetch(`${API_BASE_URL}/team-members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <KanbanHeader teamName={teamData?.name || "Equipo"} />

      <main className="flex flex-1 flex-col p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="animate-pulse text-gray-500">Cargando tablero...</p>
          </div>
        ) : (
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
              />
            ))}
          </div>
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
