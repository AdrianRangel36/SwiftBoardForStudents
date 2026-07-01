export type TeamRole = "OWNER" | "ADMIN" | "MEMBER" | "PENDING";

/**
 * @deprecated Usa `TeamRole` (PascalCase). Este alias se elimina en Fase 6.
 * Mantenido temporalmente para compatibilidad con imports existentes.
 */
export type teamRole = TeamRole;

// ─── Tipos de Dominio ─────────────────────────────────────────────────────────

export interface Team {
  teamId: number;
  name: string;
  role: TeamRole;
}

export interface TeamMemberUser {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
}

export interface TeamMember {
  id: number;     // ID del registro en la tabla TeamMember (pivot)
  userId: number; // FK → User.id
  teamId: number; // FK → Team.id
  role: TeamRole;
  user?: TeamMemberUser;
}

export interface TeamOutletContext {
  id: number;   // Campo real de la API: Team.id (NO teamId)
  name: string; // Nombre del equipo al momento de verificar acceso
}

export interface ChangeRoleDto {
  userId: number;
  teamId: number;
  role: Exclude<TeamRole, "PENDING">; // No se puede cambiar rol a PENDING manualmente
}

export interface LeaveTeamDto {
  userId: number;
  teamId: number;
}

export interface InviteMemberDto {
  userId: number;
  teamId: number;
  role: "PENDING"; 
}
