export interface Team {
  id: number;
  name: string;
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
  role: "OWNER" | "ADMIN" | "MEMBER" | "PENDING";
  user?: {
    name: string;
    paternalSurname: string;
  };
}