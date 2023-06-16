import { Task, TaskId } from "../../domain/types";
import { Wipman, WipmanStatus } from "../../domain/wipman";
import { assertNever } from "../../exhaustive-match";
import PageNotFound from "../PageNotFound";
import { TaskEditor } from "./TaskEditor";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function isLoading(status: WipmanStatus): boolean {
  switch (status) {
    case WipmanStatus.InitStarted:
      return true;
    case WipmanStatus.InitCompleted:
      return false;
    case WipmanStatus.BackendLoadStarted:
      return false;
    case WipmanStatus.BackendLoadCompleted:
      return false;
    case WipmanStatus.BrowserLoadCompleted:
      return false;
    case WipmanStatus.BrowserLoadStarted:
      return false;
    case WipmanStatus.AddTaskInApiStarted:
      return true;
    case WipmanStatus.AddTaskInApiCompleted:
      return false;
    case WipmanStatus.UpdateTaskInApiStarted:
      return true;
    case WipmanStatus.UpdateTaskInApiCompleted:
      return false;
    case WipmanStatus.DeleteTaskInApiStarted:
      return true;
    case WipmanStatus.DeleteTaskInApiCompleted:
      return false;
    case WipmanStatus.AddViewInStoreStarted:
      return false;
    case WipmanStatus.AddViewInStoreCompleted:
      return false;
    case WipmanStatus.UpdateViewInApiStarted:
      return false;
    case WipmanStatus.UpdateViewInApiCompleted:
      return false;
    case WipmanStatus.RemoveViewFromStoreStarted:
      return false;
    case WipmanStatus.RemoveViewFromStoreCompleted:
      return false;
    default:
      assertNever(status, `Unsupported WipmanStatus variant: ${status}`);
  }
}

interface TaskPageProps {
  wipman: Wipman;
}
function TaskPage({ wipman }: TaskPageProps) {
  const [loading, setLoading] = useState<boolean>(true);

  // TODO: action: ?
  const params = useParams();
  const id = params.taskId as TaskId;

  useEffect(() => {
    const subscription = wipman.status$.subscribe((status) => {
      setLoading(isLoading(status));
    });

    const status = wipman.lastStatus;
    if (status) {
      setLoading(isLoading(status));
    }

    return () => subscription.unsubscribe();
  }, [wipman]);

  if (loading === true) {
    return <div>LOADING TASK</div>;
  }

  function handleTaskUpdate(task: Task): void {
    wipman.updateTask({ task });
  }

  function handleTaskDeletion(id: TaskId): void {
    wipman.removeTask(id);
  }

  const maybeTask = wipman.getTask({ id });

  if (maybeTask === undefined) {
    console.warn(`No task found with ID: ${id}`);
    return <PageNotFound />;
  }

  const task = maybeTask;

  return (
    <TaskEditor
      task={task}
      onUpdate={handleTaskUpdate}
      onDelete={handleTaskDeletion}
      wipman={wipman}
    />
  );
}

export default TaskPage;
