import ListedTask from "../../components/ListedTask";
import { Task, TaskId, View } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { useEffect, useState } from "react";

interface ViewTasksProps {
  view: View;
  wipman: Wipman;
}
export function ViewTasks({ view, wipman }: ViewTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(
      view.tasks
        .map((id: TaskId) => wipman.getTask({ id }))
        .filter((task) => task !== undefined) as Task[]
    );
  }, [view, wipman]);

  return (
    <ul>
      {tasks.map((task, i) => (
        <ListedTask
          key={task.id}
          task={task}
          onOpenTaskView={() => alert("onOpenTaskView: TODO")}
          onRemoveTask={() => alert("onRemoveTask: TODO")}
        />
      ))}
    </ul>
  );
}
