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
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { KanbanHeader, KanbanColumn, CreateTaskForm } from "./components";
import { KANBAN_COLUMNS, type Task } from "./types";
import { useKanbanStore } from "./useKanbanStore";
import { TaskCard } from "./components/TaskCard";

export const KanbanBoard = () => {
  const { teamId } = useParams<{ teamId: string }>();

  const initialize = useKanbanStore((state) => state.initialize);
  const isLoading = useKanbanStore((state) => state.isLoading);
  const moveTask = useKanbanStore((state) => state.moveTask);
  const moveTaskLocally = useKanbanStore((state) => state.moveTaskLocally);
  const reorderTask = useKanbanStore((state) => state.reorderTask);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (teamId) {
      initialize(teamId);
    }
  }, [teamId, initialize]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getTargetStatus = (overId: string | number): Task["status"] | null => {
    if (KANBAN_COLUMNS.some((col) => col.id === String(overId))) {
      return String(overId) as Task["status"];
    }
    // over.id es una tarea: leemos su status actual del store
    const overTask = useKanbanStore
      .getState()
      .tasks.find((t) => t.id === overId);
    return overTask?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    // Capturamos el snapshot ANTES de que cualquier movimiento mute el store
    const task = useKanbanStore
      .getState()
      .tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  /**
   * onDragOver: feedback visual inmediato mientras se arrastra.
   * SOLO muta el store localmente (sin llamada a la API).
   * Esto evita el bug donde múltiples PUTs en vuelo se pisaban entre sí
   * y el guard "mismo status" en moveTask bloqueaba el movimiento final.
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const targetStatus = getTargetStatus(over.id);
    if (!targetStatus) return;

    // Leemos el estado actual directamente del store (no del closure)
    const currentTasks = useKanbanStore.getState().tasks;
    const currentActiveTask = currentTasks.find((t) => t.id === active.id);
    if (!currentActiveTask || currentActiveTask.status === targetStatus) return;

    // Solo mueve visualmente — sin PUT al backend
    moveTaskLocally(Number(active.id), targetStatus);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!activeTask) {
      setActiveTask(null);
      return;
    }

    if (!over) {
      // Soltó fuera de cualquier drop target: revertir al status original
      moveTaskLocally(Number(active.id), activeTask.status);
      setActiveTask(null);
      return;
    }

    // Estado actual de la tarea en el store (puede haber cambiado en onDragOver)
    const currentTasks = useKanbanStore.getState().tasks;
    const currentTask = currentTasks.find((t) => t.id === active.id);

    if (!currentTask) {
      setActiveTask(null);
      return;
    }

    // Caso 1: soltó sobre otra tarea de la MISMA columna → reordenar
    const overTask = currentTasks.find((t) => t.id === over.id);
    if (
      overTask &&
      overTask.status === currentTask.status &&
      over.id !== active.id
    ) {
      const columnTasks = currentTasks.filter(
        (t) => t.status === currentTask.status
      );
      const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
      const newIndex = columnTasks.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderTask(currentTask.status, oldIndex, newIndex);
      }
      setActiveTask(null);
      return;
    }

    // Caso 2: la tarea cambió de columna (onDragOver ya actualizó el store
    // localmente). Ahora persistimos al backend comparando status original vs actual.
    if (currentTask.status !== activeTask.status) {
      moveTask(Number(active.id), currentTask.status);
    }

    setActiveTask(null);
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

            <DragOverlay
              dropAnimation={{
                duration: 150,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
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
