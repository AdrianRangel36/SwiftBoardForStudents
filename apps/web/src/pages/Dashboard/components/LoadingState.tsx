import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div className="col-span-1 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-transparent sm:col-span-1 lg:col-span-3">
      <p className="animate-pulse text-gray-500">Cargando tableros...</p>
    </div>
  );
};
