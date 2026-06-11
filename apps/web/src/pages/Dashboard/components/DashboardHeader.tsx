import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import type { UserData } from "@/interfaces";

interface DashboardHeaderProps {
  user: UserData | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const userInitials = user
    ? `${user.name.charAt(0)}${user.paternalSurname.charAt(0)}`.toUpperCase()
    : "NA";

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Bienvenido a SwiftBoard
        </h2>
        <p className="text-sm text-gray-500">
          Es hora de organizar tus proyectos
        </p>
      </div>

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
  );
};
