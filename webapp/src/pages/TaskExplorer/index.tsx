import AddTask from "../../components/AddTask";
import CenteredPage from "../../components/CenteredPage";
import ListedTask from "../../components/ListedTask";
import { NO_FILTER_QUERY } from "../../components/SearchBox";
import {
  FilterQuery,
  FilterSpec,
  Task,
  TaskId,
  TaskTitle,
} from "../../lib/domain/types";
import { Wipman } from "../../lib/domain/wipman";
import { useUrlSearchParams } from "../../navigation";
import { getTaskPath } from "../../routes";
import { TaskFilter } from "./TaskFilter";
import { shouldShowTask } from "./filter";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { useNavigate } from "react-router-dom";

interface TaskExplorerProps {
  wipman: Wipman;
}
function TaskExplorer({ wipman }: TaskExplorerProps) {
  const navigateTo = useNavigate();
  const [filterSpecInUrl, setFilterSpecInUrl] = useUrlSearchParams();

  const [showCompleted, setShowCompleted] = useState<boolean>(
    filterSpecInUrl.showCompleted || false
  );
  const [query, setQuery] = useState<FilterQuery>(
    filterSpecInUrl.query || NO_FILTER_QUERY
  );
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const subscription = wipman.tasks$.subscribe((taskMap) => {
      const unsortedTasks: Task[] = [...taskMap.values()];
      console.log(`TaskExplorer::wipman.tasks$ emitted latest task list`);
      setTasks(unsortedTasks);
    });

    return () => subscription.unsubscribe();
  }, [wipman]);

  function openTask(id: TaskId): void {
    navigateTo(getTaskPath(id));
  }

  function addTask(title: TaskTitle): void {
    wipman.addTask({ title });
  }

  function handleTaskFilterChange(updated: FilterSpec): void {
    if (updated.query !== query) {
      setQuery(updated.query);
    }

    if (updated.showCompleted !== showCompleted) {
      setShowCompleted(updated.showCompleted);
    }

    setFilterSpecInUrl(updated);
  }

  if (tasks.length === 0) {
    return (
      <CenteredPage>
        <div>No tasks here</div>
        <AddTask onAdd={addTask} />
      </CenteredPage>
    );
  }

  const tasksToDisplay = tasks.filter((task) =>
    showCompleted ? true : task.completed === false
  );
  const filteredTasks =
    query && query !== NO_FILTER_QUERY
      ? tasksToDisplay.filter((task) => shouldShowTask(task, query))
      : tasksToDisplay;

  return (
    <CenteredPage>
      <TaskFilter
        spec={{ query, showCompleted }}
        onUpdate={handleTaskFilterChange}
      />

      <AddTask onAdd={addTask} />
      <DndProvider backend={TouchBackend}>
        <ul>
          {filteredTasks.map((task) => (
            <ListedTask
              key={task.id}
              task={task}
              onOpenTaskView={() => openTask(task.id)}
            />
          ))}
        </ul>
      </DndProvider>
    </CenteredPage>
  );
}

export default TaskExplorer;
