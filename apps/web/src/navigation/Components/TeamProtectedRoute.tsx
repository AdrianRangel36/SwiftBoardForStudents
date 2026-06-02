import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface TeamData {
  id: number;
  name: string;
  description?: string;
  [key: string]: any;
}

export const TeamProtectedRoute = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);

  useEffect(() => {
    const verifyTeamAccess = async () => {
      const token = localStorage.getItem("token");
      if (!token || !teamId) {
        setHasAccess(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/team/${teamId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTeamData(data);
          setHasAccess(true);
        } else if (response.status === 401 || response.status === 403) {
          setHasAccess(false);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error verifying team access:", error);
        setHasAccess(false);
      }
    };

    verifyTeamAccess();
  }, [teamId]);

  if (hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-lg font-medium text-gray-600">
          Verificando acceso al equipo...
        </span>
      </div>
    );
  }

  return hasAccess && teamData ? (
    <Outlet context={teamData} />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};
