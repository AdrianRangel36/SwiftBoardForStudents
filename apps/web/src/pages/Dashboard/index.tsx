import React, { useState } from "react";
import { DashboardHeader, TeamsGrid } from "./components";
import { useDashboard } from "./hooks";

export const Dashboard: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isLoading, user, createTeam } = useDashboard();

  const handleCreateTeam = async (teamName: string) => {
    await createTeam(teamName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <main className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tus Tableros</h1>
        </div>

        <TeamsGrid
          isLoading={isLoading}
          onCreateTeam={handleCreateTeam}
          isDialogOpen={isDialogOpen}
          onDialogOpenChange={setIsDialogOpen}
        />
      </main>
    </div>
  );
};
