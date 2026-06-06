import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void; 
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  return (
    <Card className="cursor-grab border-gray-200 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-bold text-gray-800">
          {task.name}
        </CardTitle>
        
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
            
            {/* NUEVO: Evento onClick para eliminar */}
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)} 
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
            >
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
  );
};