// ─────────────────────────────────────────────────────────────────────────────
// teamMembers.service.ts
// Consolida los fetch de: useKanbanStore.ts, TeamsGrid.tsx, KanbanHeader.tsx,
//                          Dashboard hooks.ts y teamSettingsService.ts
// ─────────────────────────────────────────────────────────────────────────────

import { httpClient } from "./http.client";
import type { Team, TeamMember, ChangeRoleDto } from "@/types";

export const teamMembersService = {
  /**
   * Obtiene todos los miembros de un equipo.
   *
   * Reemplaza `useKanbanStore.fetchTeamMembers` L56-58.
   * El backend retorna un array de `TeamMember` con la relación `user` incluida.
   */
  async findByTeam(
    teamId: string,
    token: string,
  ): Promise<TeamMember[]> {
    const data = await httpClient.get<TeamMember[]>(
      `/team-members/findallteam/${teamId}`,
      token,
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * Obtiene todos los equipos a los que pertenece un usuario.
   *
   * Reemplaza el fetch de `Dashboard hooks.ts` L33-41.
   */
  async findUserTeams(
    userId: number,
    token: string,
  ): Promise<Team[]> {
    return httpClient.get<Team[]>(
      `/team-members/userTeams/${userId}`,
      token,
    );
  },

  /**
   * Cambia el rol de un miembro dentro de un equipo.
   *
   * Reemplaza los fetch de:
   *   - `TeamsGrid.tsx` L33-44 (aceptar invitación → role MEMBER)
   *   - `teamSettingsService.ts` L53-57 (cambio de rol desde settings)
   *
   * @param dto — Contiene `userId`, `teamId` y el nuevo `role`.
   */
  async changeRole(dto: ChangeRoleDto, token: string): Promise<void> {
    await httpClient.put<void>("/team-members/changerole", dto, token);
  },

  /**
   * Retira a un usuario de un equipo (salir o ser expulsado).
   *
   * Reemplaza los fetch de:
   *   - `KanbanHeader.tsx` L94-104 (salir del equipo)
   *   - `TeamsGrid.tsx` L55-65 (rechazar invitación)
   *   - `teamSettingsService.ts` L66-69 (remover miembro desde settings)
   */
  async leave(
    userId: number,
    teamId: number,
    token: string,
  ): Promise<void> {
    await httpClient.del<void>(
      "/team-members/leaveteam",
      token,
      { userId, teamId },
    );
  },

  /**
   * Invita a un usuario por email a un equipo.
   *
   * Fusiona las operaciones de `teamSettingsService.findUserByEmail` (L78-82)
   * y `teamSettingsService.inviteMember` (L90-93) en una sola llamada pública.
   *
   * Internamente:
   *   1. Busca al usuario por email → GET `/users/search/:email`
   *   2. Crea la membresía con role PENDING → POST `/team-members/`
   *
   * El consumidor solo ve una promesa que se resuelve o rechaza.
   */
  async inviteByEmail(
    email: string,
    teamId: number,
    token: string,
  ): Promise<void> {
    // Paso 1: Buscar al usuario por email
    const user = await httpClient.get<{ id: number }>(
      `/users/search/${email}`,
      token,
    );

    // Paso 2: Crear la membresía como PENDING
    await httpClient.post<void>(
      "/team-members/",
      { userId: user.id, teamId, role: "PENDING" },
      token,
    );
  },
};
