import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { Task } from "../types";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

export const KanbanColumn = ({
  id,
  title,
  color,
  tasks,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) => {
  
  // Configuración de la columna como zona receptora
  const { isOver, setNodeRef } = useDroppable({
    id: id, // El ID de la columna será el nuevo status (ej. 'IN_PROGRESS')
  });

  return (
    <div className="flex h-[55vh] flex-col rounded-xl border border-gray-200 bg-gray-100/50 p-4 lg:h-auto lg:min-h-125">
      <div className={`mb-4 flex items-center justify-between rounded-lg border px-3 py-2 ${color}`}>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <Badge variant="secondary" className="bg-white text-gray-700 shadow-sm">
          {tasks.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 pr-3">
        {/* Envolvemos la lista en el ref del Droppable */}
        <div 
          ref={setNodeRef} 
          className={`flex flex-col gap-3 min-h-37.5 rounded-lg transition-colors p-1 ${
            isOver ? "bg-gray-200/60" : "" // Cambio de color al pasar por encima
          }`}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};