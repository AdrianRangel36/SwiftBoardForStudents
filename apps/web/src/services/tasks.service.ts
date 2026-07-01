// ─────────────────────────────────────────────────────────────────────────────
// tasks.service.ts
// Consolida los fetch de: useKanbanStore.ts y CreateTaskForm.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { httpClient } from "./http.client";
import type { Task, CreateTaskDto, UpdateTaskDto } from "@/types";

export const tasksService = {
  /**
   * Obtiene todas las tareas de un equipo.
   *
   * Reemplaza `useKanbanStore.fetchTeamTasks` (L37-40).
   * Si el backend retorna body vacío, devuelve `[]` (defensivo).
   */
  async findByTeam(teamId: string, token: string): Promise<Task[]> {
    const data = await httpClient.get<Task[]>(
      `/tasks/team-tasks/${teamId}`,
      token,
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * Crea una nueva tarea.
   *
   * Reemplaza el POST de `CreateTaskForm.tsx` L99-121.
   */
  async create(dto: CreateTaskDto, token: string): Promise<Task> {
    return httpClient.post<Task>("/tasks", dto, token);
  },

  /**
   * Actualiza una tarea existente (edición completa o cambio de status).
   *
   * Reemplaza:
   *   - El PUT de `CreateTaskForm.tsx` L99-121 (modo edición).
   *   - El PUT de `useKanbanStore.moveTask` L132-139 (drag & drop).
   */
  async update(
    id: number,
    dto: UpdateTaskDto,
    token: string,
  ): Promise<Task> {
    return httpClient.put<Task>(`/tasks/${id}`, dto, token);
  },

  /**
   * Elimina una tarea.
   *
   * Reemplaza `useKanbanStore.deleteTask` L92-94.
   */
  async remove(id: number, token: string): Promise<void> {
    await httpClient.del<void>(`/tasks/${id}`, token);
  },
};
