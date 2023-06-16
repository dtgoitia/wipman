import AddTask from "../../components/AddTask";
import CenteredPage from "../../components/CenteredPage";
import ListedTask from "../../components/ListedTask";
import { NO_FILTER_QUERY } from "../../components/SearchBox";
import { FilterQuery, Task, TaskId, TaskTitle } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { getTaskPath } from "../../routes";
import { FilterSpec, TaskFilter } from "./TaskFilter";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { useNavigate } from "react-router-dom";

interface TaskExplorerProps {
  wipman: Wipman;
}
function TaskExplorer({ wipman }: TaskExplorerProps) {
  const navigateTo = useNavigate();

  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [query, setQuery] = useState<FilterQuery>(NO_FILTER_QUERY);
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
    const _query = query.toLowerCase();

    const searchables = [task.title];
    if (task.tags.size > 0) {
      task.tags.forEach((tag) => searchables.push(tag));
    }
    if (task.content) {
      searchables.push(task.content);
    }

    for (const searchable of searchables) {
      const found = searchable.toLowerCase().includes(_query as string);
      if (found) {
        return true;
      }
    }

    return false;
  }

  const tasksToDisplay = tasks.filter((task) =>
    showCompleted ? true : task.completed === false
  );
  const filteredTasks =
    query && query !== "" ? tasksToDisplay.filter(filterTask) : tasksToDisplay;

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
