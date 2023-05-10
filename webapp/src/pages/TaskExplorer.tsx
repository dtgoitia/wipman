import AddTask from "../components/AddTask";
import CenteredPage from "../components/CenteredPage";
import ListedTask from "../components/ListedTask";
import SearchBox, { NO_FILTER_QUERY } from "../components/SearchBox";
import { FilterQuery, Task, TaskId, TaskTitle } from "../domain/types";
import { Wipman, WipmanStatus } from "../domain/wipman";
import { assertNever } from "../exhaustive-match";
import { getTaskPath } from "../routes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TaskExplorerProps {
  wipman: Wipman;
}
function TaskExplorer({ wipman }: TaskExplorerProps) {
  // TODO: action: open task view
  const navigate = useNavigate();

  const [query, setQuery] = useState<FilterQuery>(NO_FILTER_QUERY);
  const [tasks, setTasks] = useState<Task[]>([]);
  // TODO: do we even care about showing the spinner? -- maybe when we are updating one task?
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    // en este punto, el manager está vacío, pásaselo a la function del domain que va a
    // fetch the tasks from localstorage and bulk load them to the task manager

    const subscription = wipman.tasks$.subscribe((taskMap) => {
      const unsortedTasks: Task[] = [...taskMap.values()];
      console.log(`TaskExplorer::wipman.tasks$ emitted latest task list`);
      setTasks(unsortedTasks);
    });

    return subscription.unsubscribe;
  }, [wipman]);

  useEffect(() => {
    const subscription = wipman.status$.subscribe((status) => {
      switch (status) {
        case WipmanStatus.BrowserLoadStarted:
          setShowSpinner(true);
          break;
        case WipmanStatus.BrowserLoadCompleted:
          setShowSpinner(false);
          break;
        case WipmanStatus.BackendLoadStarted:
          setShowSpinner(true);
          break;
        case WipmanStatus.BackendLoadCompleted:
          setShowSpinner(false);
          break;
        case WipmanStatus.AddTaskInApiStarted:
          setShowSpinner(true);
          break;
        case WipmanStatus.AddTaskInApiCompleted:
          setShowSpinner(false);
          break;
        case WipmanStatus.UpdateTaskInApiStarted:
          setShowSpinner(true);
          break;
        case WipmanStatus.UpdateTaskInApiCompleted:
          setShowSpinner(false);
          break;
        case WipmanStatus.DeleteTaskInApiStarted:
          setShowSpinner(true);
          break;
        case WipmanStatus.DeleteTaskInApiCompleted:
          setShowSpinner(false);
          break;
        case WipmanStatus.InitStarted:
          break;
        case WipmanStatus.InitCompleted:
          break;
        case WipmanStatus.AddViewInStoreStarted:
          break;
        case WipmanStatus.AddViewInStoreCompleted:
          break;
        case WipmanStatus.RemoveViewFromStoreStarted:
          break;
        case WipmanStatus.RemoveViewFromStoreCompleted:
          break;
        default:
          assertNever(status, `Unsupported WipmanStatus variant: ${status}`);
      }
    });

    return subscription.unsubscribe;
  }, [wipman]);

  function openTask(id: TaskId): void {
    navigate(getTaskPath(id));
  }

  function addTask(title: TaskTitle): void {
    wipman.addTask({ title });
  }

  function handleFilterChange(query: FilterQuery): void {
    setQuery(query);
  }

  function handleClearSearch(): void {
    setQuery(NO_FILTER_QUERY);
  }

  if (tasks.length === 0) {
    return (
      <CenteredPage>
        <div>No tasks here</div>
        <AddTask onAdd={addTask} />
      </CenteredPage>
    );
  }

  function filterTask(task: Task): boolean {
    const searchable = `${task.title} ${task.content}`;
    return searchable.includes(query as string);
  }

  const filteredTasks =
    query && query !== "" ? tasks.filter(filterTask) : tasks;

  return (
    <CenteredPage>
      <SearchBox
        query={query as string}
        onChange={handleFilterChange}
        clearSearch={handleClearSearch}
        onFocus={() => {}}
      />
      <ul>
        {filteredTasks.map((task) => (
          <ListedTask
            key={task.id}
            task={task}
            onOpenTaskView={() => openTask(task.id)}
          />
        ))}
      </ul>
      <AddTask onAdd={addTask} />
    </CenteredPage>
  );
}

export default TaskExplorer;
