import { MoreVertical, Pencil, Trash2, GripVertical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { Task } from "../types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  // Configuración de dnd-kit para este elemento
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id.toString(),
    data: { task }, // Guardamos la data de la tarea por si la necesitamos al soltar
  });

  // Convertimos las coordenadas de arrastre a CSS
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto", // Para que flote por encima del resto
    touchAction: "none", // Previene problemas de scroll en móviles al arrastrar
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-gray-200 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
          
          <div className="flex items-center gap-2">
            {/* AGARRADERA (DRAG HANDLE): Aquí aplicamos los listeners para arrastrar */}
            <div 
              {...listeners} 
              {...attributes} 
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            
            <CardTitle className="text-sm font-bold text-gray-800">
              {task.name}
            </CardTitle>
          </div>

          {/* Menú de los 3 puntitos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
                <span className="sr-only">Abrir menú</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                <span>Modificar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <p className="mb-3 line-clamp-2 text-xs text-gray-500">
            {task.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};