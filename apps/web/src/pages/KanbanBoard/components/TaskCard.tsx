import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreVertical, Pencil, Trash2, Calendar, Clock } from "lucide-react";

import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";
import type { Task, TeamMember } from "../types";

interface TaskCardProps {
  task: Task;
  members?: TeamMember[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  // NUEVO: Pásale esta prop desde el componente padre que hace el useSortable
  isDragging?: boolean;
}

export const TaskCard = ({
  task,
  members = [],
  onEdit,
  onDelete,
  isDragging = false,
}: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const assignedMember = members.find((m) => m.id === task.assignedMemberId);

  const getInitials = (name?: string, surname?: string) => {
    if (!name) return "?";
    return `${name.charAt(0)}${surname ? surname.charAt(0) : ""}`.toUpperCase();
  };

  const handleCardClick = () => {
    // Evitamos que la tarjeta intente expandirse o re-renderizarse si está en el aire
    if (!isDragging) {
      setIsExpanded((prev) => !prev);
    }
  };

  // Función para detener AMBOS eventos (clic y arrastre) en botones internos
  const stopEventPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col overflow-hidden border-gray-200 bg-white transition-all duration-200 ease-in-out",
        // Estilos dinámicos si se está arrastrando
        isDragging
          ? "z-50 scale-[1.02] cursor-grabbing opacity-60 shadow-xl ring-1 ring-blue-500/50"
          : "cursor-grab shadow-sm hover:border-gray-300 hover:shadow-md",
        // Resaltado sutil si está expandida
        isExpanded && !isDragging ? "border-blue-200/60 shadow-sm" : ""
      )}
    >
      {/* === ESTADO COMPACTO (Siempre visible, padding reducido a p-3) === */}
      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 text-sm leading-tight font-semibold text-gray-800">
            {task.name}
          </span>

          {/* Zona de control aislada del Drag and Drop */}
          <div
            className="flex shrink-0"
            onClick={stopEventPropagation}
            onPointerDown={stopEventPropagation} // CRÍTICO: Evita arrastrar desde el botón
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:bg-gray-100/50 hover:text-gray-900"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onEdit(task)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Modificar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {!isExpanded && (
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
            <div className="flex items-center gap-1.5 rounded-sm bg-gray-100/80 px-1.5 py-0.5">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span
                className={
                  new Date(task.endDate) < new Date() ? "text-red-600" : ""
                }
              >
                {format(new Date(task.endDate), "d MMM", { locale: es })}
              </span>
            </div>

            <div className="flex gap-1.5">
              <span>
                {assignedMember?.user?.name}{" "}
                {assignedMember?.user?.paternalSurname}
              </span>
              <Avatar
                className="h-5 w-5 border border-gray-200"
                title={assignedMember?.user?.name || "Sin asignar"}
              >
                <AvatarFallback className="bg-slate-100 text-[9px] font-semibold text-slate-600">
                  {getInitials(
                    assignedMember?.user?.name,
                    assignedMember?.user?.paternalSurname
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded && !isDragging
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
        // Prevenir que el clic en la descripción cierre la tarjeta
        onClick={stopEventPropagation}
        onPointerDown={stopEventPropagation}
      >
        <div className="overflow-hidden">
          {/* Contenido expandido con su propio padding */}
          <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 p-3 pt-0">
            {task.description && (
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
                {task.description}
              </p>
            )}

            {task.goals && (
              <div className="rounded border border-blue-100/50 bg-blue-50/50 p-2">
                <span className="mb-1 block text-[10px] font-bold text-blue-800/70 uppercase">
                  Objetivos
                </span>
                <p className="text-[11px] leading-relaxed text-gray-700">
                  {task.goals}
                </p>
              </div>
            )}

            <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-semibold">
                Inicio: {format(new Date(task.startDate), "dd/MM/yyyy")}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-semibold">
                Fecha de entrega: {format(new Date(task.endDate), "dd/MM/yyyy")}
              </span>
            </div>

            <div className="flex  gap-1.5">
              <Avatar
                className="h-6 w-6 border border-gray-200"
                title={assignedMember?.user?.name || "Sin asignar"}
              >
                <AvatarFallback className="bg-slate-100 text-[9px] font-semibold text-slate-600">
                  {getInitials(
                    assignedMember?.user?.name,
                    assignedMember?.user?.paternalSurname
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">
                {assignedMember?.user?.name}{" "}
                {assignedMember?.user?.paternalSurname}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
