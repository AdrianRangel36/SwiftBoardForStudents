// ─────────────────────────────────────────────────────────────────────────────
// teamSettingsService.ts
//
// @deprecated — Este archivo ahora DELEGA a los servicios centralizados
// (`teamService` y `teamMembersService`). Se mantendrá como wrapper temporal
// mientras `useTeamSettingsActions.ts` siga importándolo. Se eliminará cuando
// la migración de consumidores esté completa.
//
// La API pública (nombres de método y firmas) NO cambia — los consumidores
// existentes siguen funcionando sin modificaciones.
// ─────────────────────────────────────────────────────────────────────────────

import { teamService, teamMembersService } from "@/services";

// ── Tipos de parámetros (se mantiene para compatibilidad) ─────────────────────

interface ChangeMemberRoleParams {
  teamId: number;
  userId: number;
  memberId: number;
  role: string;
  token: string;
}

// ── Servicio delegador ───────────────────────────────────────────────────────

/** @deprecated Usa `teamService` y `teamMembersService` de `@/services` directamente. */
export const teamSettingsService = {
  async updateTeamName(
    teamId: number,
    name: string,
    token: string,
  ): Promise<void> {
    return teamService.update(teamId, name, token);
  },

  async changeMemberRole({
    teamId,
    userId,
    role,
    token,
  }: ChangeMemberRoleParams): Promise<void> {
    return teamMembersService.changeRole({ userId, teamId, role: role as any }, token);
  },

  async removeMember(
    teamId: number,
    userId: number,
    token: string,
  ): Promise<void> {
    return teamMembersService.leave(userId, teamId, token);
  },

  async findUserByEmail(
    email: string,
    token: string,
  ): Promise<{ id: number }> {
    // Nota: este método queda expuesto individualmente por compatibilidad.
    // En el servicio centralizado, `inviteByEmail` fusiona ambos pasos.
    const { httpClient } = await import("@/services/http.client");
    return httpClient.get<{ id: number }>(`/users/search/${email}`, token);
  },

  async inviteMember(
    teamId: number,
    userId: number,
    token: string,
  ): Promise<void> {
    const { httpClient } = await import("@/services/http.client");
    await httpClient.post<void>(
      "/team-members/",
      { userId, teamId, role: "PENDING" },
      token,
    );
  },
};
