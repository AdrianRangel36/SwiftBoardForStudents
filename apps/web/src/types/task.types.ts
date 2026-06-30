export type TaskStatus = "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export interface Task {
  id: number;
  assignedMemberId: number; // FK → TeamMember.id (no User.id directamente)
  teamId: number;
  status: TaskStatus;
  name: string;
  description: string;
  goals: string;
  startDate: string;
  endDate: string;
}

export interface CreateTaskDto {
  name: string;
  description: string;
  goals: string;
  status: TaskStatus;
  teamId: number;
  assignedMemberId: number;
  startDate: string;
  endDate: string;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  goals?: string;
  status?: TaskStatus;
  assignedMemberId?: number;
  startDate?: string;
  endDate?: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
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
] as const satisfies KanbanColumn[];
