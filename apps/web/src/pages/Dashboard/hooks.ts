import type { Team, UserData } from "@/interfaces";
import { useState, useCallback, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useDashboard = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTeams(parsedUser);
    }
  }, []);

  const fetchTeams = useCallback(
    async (userData?: UserData) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const currentUser = userData || user;
        const userId = currentUser?.id;

        if (!userId || !token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/team/userTeams/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al obtener los equipos");

        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const createTeam = useCallback(
    async (teamName: string) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/team`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: teamName }),
        });

        if (!response.ok) throw new Error("Error al crear equipo");

        await fetchTeams();
      } catch (error) {
        console.error("Error creating team:", error);
        throw error;
      }
    },
    [fetchTeams]
  );

  return { teams, isLoading, user, fetchTeams, createTeam };
};
