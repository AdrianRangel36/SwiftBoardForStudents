import type { Team, UserData } from "@/interfaces";

export interface DashboardContextType {
  teams: Team[];
  isLoading: boolean;
  user: UserData | null;
  fetchTeams: () => Promise<void>;
  createTeam: (teamName: string) => Promise<void>;
}
