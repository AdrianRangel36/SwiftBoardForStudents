export type teamRole = "OWNER" | "ADMIN" | "MEMBER" | "PENDING";

export interface Team {
  teamId: number;
  name: string;
  role: teamRole;
}

export interface UserData {
  id: number;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
}

export interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role: teamRole;
  user?: {
    name: string;
    paternalSurname: string;
  };
}
