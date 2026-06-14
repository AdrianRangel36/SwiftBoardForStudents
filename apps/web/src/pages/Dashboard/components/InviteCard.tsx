import React from "react";
import { Check, X, MailOpen } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import type { Team } from "@/interfaces";

interface InviteCardProps {
  team: Team;
  onAccept: (teamId: number) => void;
  onReject: (teamId: number) => void;
}

export const InviteCard: React.FC<InviteCardProps> = ({
  team,
  onAccept,
  onReject,
}) => {
  return (
    <Card className="relative min-h-40 overflow-hidden border-blue-200 bg-blue-50/40 transition-shadow hover:shadow-md">
      {/* Icono de fondo decorativo */}
      <div className="pointer-events-none absolute -top-4 -right-4 p-3 opacity-[0.05]">
        <MailOpen className="h-32 w-32 text-blue-900" />
      </div>

      <CardHeader className="relative z-10 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
          {team.name}
        </CardTitle>
        <CardDescription className="text-blue-700/80">
          Te han invitado a este equipo
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 pb-2">
        <p className="text-xs text-gray-600">
          ¿Deseas unirte a este espacio de trabajo y colaborar?
        </p>
      </CardContent>

      <CardFooter className="relative z-10 mt-auto flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-red-200 bg-white text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onReject(team.teamId)}
        >
          <X className="mr-1 h-3.5 w-3.5" /> Rechazar
        </Button>
        <Button
          size="sm"
          className="h-8 bg-blue-600 text-xs shadow-sm hover:bg-blue-700"
          onClick={() => onAccept(team.teamId)}
        >
          <Check className="mr-1 h-3.5 w-3.5" /> Aceptar
        </Button>
      </CardFooter>
    </Card>
  );
};
