import ListedTask from "../../components/ListedTask";
import { Task, TaskId, View } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { getTaskPath } from "../../routes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ViewTasksProps {
  view: View;
  wipman: Wipman;
}
export function ViewTasks({ view, wipman }: ViewTasksProps) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(
      view.tasks
        .map((id: TaskId) => wipman.getTask({ id }))
        .filter((task) => task !== undefined) as Task[]
    );
  }, [view, wipman]);

  function openTask(id: TaskId): void {
    navigate(getTaskPath(id));
  }

  return (
    <ul>
      {tasks.map((task) => (
        <ListedTask
          key={task.id}
          task={task}
          onOpenTaskView={() => openTask(task.id)}
        />
      ))}
    </ul>
  );
}
