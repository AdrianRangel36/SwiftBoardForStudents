import { create } from "zustand";
import type { KanbanState, Task } from "./types";
import type { TeamMember } from "@/interfaces";
import { arrayMove } from "@dnd-kit/sortable";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useKanbanStore = create<KanbanState>((set, get) => ({
  // Valores iniciales
  tasks: [],
  teamMembers: [],
  isLoading: true,
  taskToEdit: null,
  user: null,
  teamId: null,
  teamName: null,

  initialize: async (teamId: string) => {
    set({ teamId, isLoading: true });

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      set({ user: JSON.parse(storedUser) });
    }

    await Promise.all([
      get().fetchTeamTasks(teamId),
      get().fetchTeamMembers(teamId),
    ]);

    set({ isLoading: false });
  },

  fetchTeamTasks: async (teamId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/tasks/team-tasks/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Error fetching tasks");

      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      set({ tasks: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ tasks: [] });
    }
  },

  fetchTeamMembers: async (teamId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/team-members/findallteam/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Error fetching members");

      const text = await response.text();
      const allMembers: TeamMember[] = text ? JSON.parse(text) : [];

      if (Array.isArray(allMembers)) {
        const membersOfThisTeam = allMembers.filter(
          (m) => m.teamId === Number(teamId)
        );
        set({ teamMembers: membersOfThisTeam });
      } else {
        set({ teamMembers: [] });
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      set({ teamMembers: [] });
    }
  },

  setTaskToEdit: (task) => {
    set({ taskToEdit: task });
  },

  deleteTask: async (taskId: number) => {
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

      const { tasks, taskToEdit } = get();
      set({
        tasks: tasks.filter((t) => t.id !== taskId),
        taskToEdit: taskToEdit?.id === taskId ? null : taskToEdit,
      });
    } catch (error) {
      console.error("Error eliminando la tarea:", error);
      alert("Hubo un problema al intentar eliminar la tarea.");
    }
  },

  moveTaskLocally: (taskId: number, newStatus: Task["status"]) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }));
  },

  moveTask: async (taskId: number, newStatus: Task["status"]) => {
    const { tasks, fetchTeamTasks, teamId } = get();
    const task = tasks.find((t) => t.id === taskId);

    if (task && task.status !== newStatus) {
      set({
        tasks: tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      });
    }

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
      // Revertir al estado del servidor si falla
      if (teamId) fetchTeamTasks(teamId);
    }
  },

  reorderTask: (status, oldIndex, newIndex) => {
    set((state) => {
      const columnTasks = state.tasks.filter((t) => t.status === status);
      const otherTasks = state.tasks.filter((t) => t.status !== status);
      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      return { tasks: [...otherTasks, ...reordered] };
    });
  },

  refetchTeamData: async () => {
    const { teamId, fetchTeamTasks, fetchTeamMembers } = get();
    if (!teamId) return;
    await Promise.all([fetchTeamTasks(teamId), fetchTeamMembers(teamId)]);
  },

  setTeamName: (newName: string) => {
    set({ teamName: newName });
  },
}));
