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

export interface DashboardContextType {
  teams: Team[];
  isLoading: boolean;
  user: UserData | null;
  fetchTeams: () => Promise<void>;
  createTeam: (teamName: string) => Promise<void>;
}
