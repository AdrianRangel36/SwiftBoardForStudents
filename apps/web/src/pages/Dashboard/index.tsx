import { useEffect, useState } from "react";
import { Plus, LayoutDashboard } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { useNavigate } from "react-router-dom";

interface Team {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
}

export const Dashboard:React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const userInitials = user
    ? `${user.name.charAt(0)}${user.paternalSurname.charAt(0)}`.toUpperCase()
    : "NA";

  const navigate = useNavigate(); // Inicializa el hook

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTeams(parsedUser);
    }
  }, []);

  const fetchTeams = async (userData?: UserData) => {
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
        `http://localhost:3000/team/userTeams/${userId}`,
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
  };

  const handleCreateTeam = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (!response.ok) throw new Error("Error al crear equipo");

      setIsDialogOpen(false);
      setNewTeamName("");
      fetchTeams();
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Bienvenido a SwiftBoard
          </h2>
          <p className="text-sm text-gray-500">
            Es hora de organizar tus proyectos
          </p>
        </div>

        {/* Sección usuario */}
        <div className="flex cursor-pointer items-center gap-3 rounded-full border border-gray-200 bg-gray-50 py-1.5 pr-2 pl-4 transition-colors hover:bg-gray-100">
          <span className="text-sm font-medium text-gray-700">
            {user?.name}
          </span>
          <Avatar className="h-9 w-9 border border-gray-300">
            <AvatarImage src="" alt={user?.name} />
            <AvatarFallback className="bg-blue-100 font-semibold text-blue-700">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tus Tableros</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Modal de Creación integrado en la primera tarjeta */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="flex min-h-40 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-transparent hover:border-gray-400 hover:bg-gray-50">
                <Plus className="mb-2 h-8 w-8 text-gray-500" />
                <p className="font-medium text-gray-600">Crear tablero</p>
              </Card>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nuevo equipo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del tablero/equipo</Label>
                  <Input
                    id="name"
                    placeholder="Ej. Proyecto de Software"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Crear
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="col-span-1 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-transparent sm:col-span-1 lg:col-span-3">
              <p className="animate-pulse text-gray-500">
                Cargando tableros...
              </p>
            </div>
          ) : teams.length === 0 ? (
            <div className="col-span-1 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-transparent text-center opacity-80 sm:col-span-1 lg:col-span-2">
              <div className="mb-3 rounded-full bg-gray-100 p-3">
                <LayoutDashboard className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Ningún tablero a la vista
              </h3>
              <p className="mt-1 max-w-62.5 text-sm text-gray-500">
                Aún no perteneces a ningún equipo. Crea tu primer tablero para
                comenzar.
              </p>
            </div>
          ) : (
            teams.map((team) => (
              <Card
                key={team.id}
                className="min-h-40 cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/team/${team.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>
                    Espacio de trabajo del equipo
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
