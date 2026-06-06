import React from "react";
import { LayoutDashboard } from "lucide-react";

export const EmptyState: React.FC = () => {
  return (
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
  );
};
