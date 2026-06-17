import type { TeamMember, UserData } from "@/interfaces";

export interface Task {
  id: number;
  assignedMemberId: number;
  teamId: number;
  status: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  name: string;
  description: string;
  goals: string;
  startDate: string;
  endDate: string;
}

export const KANBAN_COLUMNS = [
  { id: "TO_DO", title: "Por Hacer", color: "bg-slate-200 border-slate-300" },
  {
    id: "IN_PROGRESS",
    title: "En Progreso",
    color: "bg-blue-100 border-blue-200",
  },
  {
    id: "IN_REVIEW",
    title: "En Revisión",
    color: "bg-yellow-100 border-yellow-200",
  },
  { id: "DONE", title: "Completado", color: "bg-green-100 border-green-200" },
] as const;

export interface KanbanState {
  // --- ESTADO ---
  tasks: Task[];
  teamMembers: TeamMember[];
  isLoading: boolean;
  taskToEdit: Task | null;
  user: UserData | null;
  teamId: string | null;
  teamName: string | null;

  // --- ACCIONES ---
  initialize: (teamId: string) => Promise<void>;
  fetchTeamTasks: (teamId: string) => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<void>;
  setTaskToEdit: (task: Task | null) => void;
  deleteTask: (taskId: number) => Promise<void>;
  moveTask: (taskId: number, newStatus: Task["status"]) => Promise<void>;
  refetchTeamData: () => Promise<void>;
  setTeamName: (newName: string) => void;
}
