import { useEffect, useState, useRef } from "react";
import { useParams, useOutletContext } from "react-router-dom";

import { KanbanHeader, KanbanColumn, CreateTaskForm } from "./components";
import type { Task, TeamData, TeamMember } from "./types";
import { KANBAN_COLUMNS } from "./types";

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
        `http://localhost:3000/tasks/team-tasks/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const allMembers: TeamMember[] = await response.json();
        const membersOfThisTeam = allMembers.filter(
          (m) => m.teamId === Number(teamId)
        );
        setTeamMembers(membersOfThisTeam);
      }
    } catch (error) {
      console.error("Error:", error);
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
                onEditTask={handleEditTask} // <--- PASAMOS LA FUNCIÓN
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
