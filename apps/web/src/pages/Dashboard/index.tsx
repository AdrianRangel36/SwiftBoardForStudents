import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

interface Team {
  id: number;
  name: string;
}

export const Dashboard = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []); 

  const fetchTeams = async () => {
    try {
        setIsLoading(true);
        const token = localStorage.getItem("token"); 
        const response = await fetch("http://localhost:3000/team", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            }
        });

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
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: newTeamName }) 
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tus Tableros</h1>
        {/* Aquí iría el Avatar del usuario en un futuro */}
        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Modal de Creación integrado en la primera tarjeta */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-transparent hover:border-gray-400 hover:bg-gray-50 min-h-[160px]">
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
              <Button type="submit" className="w-full">Crear</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Renderizado dinámico de la lista de equipos */}
        {isLoading ? (
          <p>Cargando tableros...</p>
        ) : (
          teams.map((team) => (
            <Card key={team.id} className="cursor-pointer transition-shadow hover:shadow-md min-h-40">
              <CardHeader>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <CardDescription>Espacio de trabajo del equipo</CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};