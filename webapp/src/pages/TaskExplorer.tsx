import AddTask from "../components/AddTask";
import CenteredPage from "../components/CenteredPage";
import ListedTask from "../components/ListedTask";
import { Task, TaskId } from "../domain/types";
import { getTaskPath } from "../routes";
import taskManager from "../services/tasks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TaskExplorer() {
  // TODO: action: open task view
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const subscription = taskManager.tasks$.subscribe((taskMap) => {
      const unsortedTasks: Task[] = [...taskMap.values()];
      setTasks(unsortedTasks);
    });
    return subscription.unsubscribe;
  }, []);

  function openTask(id: TaskId): void {
    navigate(getTaskPath(id));
  }

  function addTask(title: string): void {
    taskManager.addTask({ title });
  }

  if (taskManager.tasks.size === 0) {
    return (
      <CenteredPage>
        <div>No tasks here</div>
        <AddTask onAdd={addTask} />
      </CenteredPage>
    );
  }

  return (
    <CenteredPage>
      <ul>
        {tasks.map((task) => (
          <ListedTask
            key={task.id}
            task={task}
            onOpenTaskView={() => openTask(task.id)}
            onRemoveTask={() => taskManager.removeTask(task.id)}
          />
        ))}
      </ul>
      <AddTask onAdd={addTask} />
    </CenteredPage>
  );
}

export default TaskExplorer;
