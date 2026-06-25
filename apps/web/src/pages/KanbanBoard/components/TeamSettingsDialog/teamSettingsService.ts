
// ─────────────────────────────────────────────────────────────────────────────
// Responsabilidad única: comunicación HTTP con la API
// Los componentes y hooks dependen de esta abstracción, no de fetch directo
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ── Helpers privados ──────────────────────────────────────────────────────────

const buildAuthHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const assertResponseOk = (res: Response, errorMessage: string): void => {
  if (!res.ok) throw new Error(errorMessage);
};

// ── Tipos de parámetros ───────────────────────────────────────────────────────

interface ChangeMemberRoleParams {
  teamId: number;
  userId: number;
  memberId: number;
  role: string;
  token: string;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const teamSettingsService = {
  async updateTeamName(
    teamId: number,
    name: string,
    token: string
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/team/${teamId}`, {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ name }),
    });
    assertResponseOk(res, "Error cambiando el nombre del equipo");
  },

  async changeMemberRole({
    teamId,
    userId,
    memberId,
    role,
    token,
  }: ChangeMemberRoleParams): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/team-members/changerole`, {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ userId, teamId, role }),
    });
    assertResponseOk(res, `Error cambiando el rol del miembro ${memberId}`);
  },

  async removeMember(
    teamId: number,
    userId: number,
    token: string
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/team-members/leaveteam`, {
      method: "DELETE",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ userId, teamId }),
    });
    assertResponseOk(res, `Error al eliminar al miembro ${userId}`);
  },

  async findUserByEmail(
    email: string,
    token: string
  ): Promise<{ id: number }> {
    const res = await fetch(`${API_BASE_URL}/users/search/${email}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assertResponseOk(res, "El usuario no existe");
    return res.json() as Promise<{ id: number }>;
  },

  async inviteMember(
    teamId: number,
    userId: number,
    token: string
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/team-members/`, {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ userId, teamId, role: "PENDING" }),
    });
    assertResponseOk(res, "Error al invitar al miembro");
  },
};
