import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { KanbanHeader, KanbanColumn, CreateTaskForm } from "./components";
import { KANBAN_COLUMNS, type Task } from "./types";
import { useKanbanStore } from "./useKanbanStore";

export const KanbanBoard = () => {
const { teamId } = useParams<{ teamId: string }>();

  const initialize = useKanbanStore((state) => state.initialize);
  const isLoading = useKanbanStore((state) => state.isLoading);
  const moveTask = useKanbanStore((state) => state.moveTask);

  // Disparamos la carga inicial de datos cuando cambia el teamId
  useEffect(() => {
    if (teamId) {
      initialize(teamId);
    }
  }, [teamId, initialize]);

  // Configuración de sensores para el Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const newStatus = over.id as Task["status"];

    // Toda la lógica compleja y la llamada PUT a la API ahora está en Zustand
    moveTask(taskId, newStatus);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Ya no pasamos props. El Header se encargará de buscar lo suyo */}
      <KanbanHeader />
      
      <main className="flex flex-1 flex-col p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="animate-pulse text-gray-500">Cargando tablero...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
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
          </DndContext>
        )}

        <div>
          <CreateTaskForm />
        </div>
      </main>
    </div>
  );
};