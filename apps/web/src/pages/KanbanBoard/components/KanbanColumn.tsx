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
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-[55vh] flex-col rounded-xl border p-4 transition-all duration-200 lg:h-auto lg:min-h-[500px] ${
        isOver
          ? "border-indigo-300 bg-indigo-50/60 shadow-inner" // Efecto cuando la tarjeta sobrevuela TODA la columna
          : "border-gray-200 bg-gray-100/50"
      }`}
    >
      <div
        className={`mb-4 flex items-center justify-between rounded-lg border px-3 py-2 ${color}`}
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <Badge variant="secondary" className="bg-white text-gray-700 shadow-sm">
          {tasks.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 pr-3">
        {/* 2. Limpiamos este div, ya no necesita el ref ni los estilos dinámicos */}
        <div className="flex flex-col gap-3 pb-4">
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
