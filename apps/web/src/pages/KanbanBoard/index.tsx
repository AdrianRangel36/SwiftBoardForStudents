import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { KanbanHeader, KanbanColumn, CreateTaskForm } from "./components";
import { KANBAN_COLUMNS, type Task } from "./types";
import { useKanbanStore } from "./useKanbanStore";
import { TaskCard } from "./components/TaskCard";

export const KanbanBoard = () => {
  const { teamId } = useParams<{ teamId: string }>();

  const initialize = useKanbanStore((state) => state.initialize);
  const isLoading = useKanbanStore((state) => state.isLoading);
  const tasks = useKanbanStore((state) => state.tasks);
  const moveTask = useKanbanStore((state) => state.moveTask);
  const reorderTask = useKanbanStore((state) => state.reorderTask);

  // Tarea que está siendo arrastrada actualmente (para el DragOverlay)
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (teamId) {
      initialize(teamId);
    }
  }, [teamId, initialize]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Dado un `over.id`, determina el status (columna) de destino.
   * `over` puede ser una columna (type: "Column") o una tarea (type: "Task").
   * En el segundo caso buscamos la tarea y retornamos su status.
   */
  const getTargetStatus = (
    overId: string | number
  ): Task["status"] | null => {
    // ¿Es el id de una columna conocida?
    const isColumn = KANBAN_COLUMNS.some((col) => col.id === String(overId));
    if (isColumn) return String(overId) as Task["status"];

    // Si no, debe ser el id de una tarea — buscamos su columna
    const overTask = tasks.find((t) => t.id === overId);
    return overTask ? overTask.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const targetStatus = getTargetStatus(over.id);
    if (!targetStatus || activeTask.status === targetStatus) return;

    moveTask(Number(active.id), targetStatus);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const targetStatus = getTargetStatus(over.id);
    if (!targetStatus) return;
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && overTask.status === activeTask.status) {
      const columnTasks = tasks.filter((t) => t.status === activeTask.status);
      const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
      const newIndex = columnTasks.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderTask(activeTask.status, oldIndex, newIndex);
      }
      return;
    }

    if (activeTask.status !== targetStatus) {
      moveTask(Number(active.id), targetStatus);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <KanbanHeader />

      <main className="flex flex-1 flex-col p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="animate-pulse text-gray-500">Cargando tablero...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {KANBAN_COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                />
              ))}
            </div>

            {/*
              DragOverlay: renderiza una copia "flotante" de la tarjeta que sigue
              al cursor. Sin esto, dnd-kit deja la tarjeta original en su sitio
              con opacidad reducida, causando el bug visual al recorrer otras
              tarjetas 
            */}
            
            <DragOverlay dropAnimation={{
              duration: 150,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}>
              {activeTask ? (
                <TaskCard task={activeTask} isDragging={true} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <div>
          <CreateTaskForm />
        </div>
      </main>
    </div>
  );
};