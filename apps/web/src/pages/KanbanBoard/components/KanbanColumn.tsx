import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { Task } from "../types";
import { TaskCard } from "./TaskCard";
import { useKanbanStore } from "../useKanbanStore";

// 1. SUB-COMPONENTE PARA LAS TAREAS
interface SortableTaskProps {
  task: Task;
}

const SortableTask = ({ task }: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        isDragging={isDragging} 
      />
    </div>
  );
};

// 2. COMPONENTE PRINCIPAL DE LA COLUMNA
interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
}

export const KanbanColumn = ({
  id,
  title,
  color,
}: KanbanColumnProps) => {
  
  // Extraemos y filtramos las tareas correspondientes a ESTA columna directamente de Zustand
  const tasks = useKanbanStore((state) => state.tasks.filter((t) => t.status === id));

  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "Column",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-[55vh] flex-col rounded-xl border p-4 transition-all duration-200 lg:h-auto lg:min-h-125 ${
        isOver
          ? "border-indigo-300 bg-indigo-50/60 shadow-inner"
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
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 pb-4">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
              />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
};