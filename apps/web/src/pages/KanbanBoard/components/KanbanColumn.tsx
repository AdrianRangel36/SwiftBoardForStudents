import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { Task, TeamMember } from "../types";
import { TaskCard } from "./TaskCard";

// 1. SUB-COMPONENTE PARA LAS TAREAS
// Este componente se encarga individualmente de la lógica de arrastre para cada tarjeta
interface SortableTaskProps {
  task: Task;
  members: TeamMember[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

const SortableTask = ({ task, members, onEditTask, onDeleteTask }: SortableTaskProps) => {
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

  // Estilos requeridos por dnd-kit para animar el movimiento
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // Le pasamos la referencia y los listeners (eventos de puntero/drag) al contenedor
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        members={members}
        isDragging={isDragging} // Ahora sí, dnd-kit nos dice si esta tarjeta específica está volando
        onEdit={onEditTask}
        onDelete={onDeleteTask}
      />
    </div>
  );
};

// 2. COMPONENTE PRINCIPAL DE LA COLUMNA
interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  members: TeamMember[];
}

export const KanbanColumn = ({
  id,
  title,
  color,
  tasks,
  onEditTask,
  onDeleteTask,
  members,
}: KanbanColumnProps) => {
  // Hook para convertir la columna entera en una zona para soltar elementos (Droppable)
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "Column",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-[55vh] flex-col rounded-xl border p-4 transition-all duration-200 lg:h-auto lg:min-h-[500px] ${
        isOver
          ? "border-indigo-300 bg-indigo-50/60 shadow-inner" // Efecto cuando la tarjeta sobrevuela la columna
          : "border-gray-200 bg-gray-100/50"
      }`}
    >
      {/* HEADER DE LA COLUMNA */}
      <div
        className={`mb-4 flex items-center justify-between rounded-lg border px-3 py-2 ${color}`}
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <Badge variant="secondary" className="bg-white text-gray-700 shadow-sm">
          {tasks.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 pr-3">
        {/*
          SortableContext es FUNDAMENTAL en @dnd-kit para que las tarjetas
          puedan reordenarse de forma fluida y empujarse unas a otras
          dentro de la misma columna.
        */}
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 pb-4">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                members={members}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
};