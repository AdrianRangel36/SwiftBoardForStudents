// ─────────────────────────────────────────────────────────────────────────────
// team.service.ts
// Consolida los fetch de: TeamProtectedRoute.tsx, KanbanHeader.tsx,
//                          teamSettingsService.ts y Dashboard hooks.ts
// ─────────────────────────────────────────────────────────────────────────────

import { httpClient } from "./http.client";
import type { TeamOutletContext } from "@/types";

export const teamService = {
  /**
   * Obtiene los datos de un equipo por su ID.
   *
   * Reemplaza el fetch de `TeamProtectedRoute.tsx` L27-33.
   * El backend retorna `{ id, name, ... }` que mapeamos a `TeamOutletContext`.
   */
  async findOne(
    teamId: number,
    token: string,
  ): Promise<TeamOutletContext> {
    return httpClient.get<TeamOutletContext>(`/team/${teamId}`, token);
  },

  /**
   * Crea un nuevo equipo.
   *
   * Reemplaza el fetch de `Dashboard hooks.ts` L61-67.
   */
  async create(name: string, token: string): Promise<void> {
    await httpClient.post<void>("/team", { name }, token);
  },

  /**
   * Actualiza el nombre de un equipo.
   *
   * Reemplaza `teamSettingsService.updateTeamName` L38-43.
   */
  async update(
    teamId: number,
    name: string,
    token: string,
  ): Promise<void> {
    await httpClient.put<void>(`/team/${teamId}`, { name }, token);
  },

  /**
   * Elimina un equipo completo.
   *
   * Reemplaza el fetch de `KanbanHeader.tsx` L66-68.
   */
  async remove(teamId: number, token: string): Promise<void> {
    await httpClient.del<void>(`/team/${teamId}`, token);
  },
};
