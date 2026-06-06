import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <Card className="cursor-grab border-gray-200 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold text-gray-800">
          {task.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-3 line-clamp-2 text-xs text-gray-500">
          {task.description}
        </p>
      </CardContent>
    </Card>
  );
};
