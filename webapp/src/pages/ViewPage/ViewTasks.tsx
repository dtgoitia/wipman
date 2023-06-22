import ListedTask from "../../components/ListedTask";
import { NO_FILTER_QUERY } from "../../components/SearchBox";
import { unreachable } from "../../devex";
import { FilterQuery, Task, TaskId, View } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { useUrlSearchParams } from "../../navigation";
import { getTaskPath } from "../../routes";
import { FilterSpec, TaskFilter } from "../TaskExplorer/TaskFilter";
import { shouldShowTask } from "../TaskExplorer/filter";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { useNavigate } from "react-router-dom";

interface Props {
  view: View;
  wipman: Wipman;
}
export function ViewTasks({ view, wipman }: Props) {
  const navigate = useNavigate();
  const [queryInUrl, setQueryInUrl] = useUrlSearchParams();

  const [taskIds, setTaskIds] = useState<TaskId[]>([]);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [query, setQuery] = useState<FilterQuery>(
    queryInUrl || NO_FILTER_QUERY
  );

  useEffect(() => {
    const subscription = wipman.views$.subscribe(() => {
      const latestView = wipman.getView({ id: view.id });
      if (latestView === undefined) {
        throw unreachable({ message: `View ${view.id} not found` });
      }
      setTaskIds(latestView.tasks);
    });

    setTaskIds(view.tasks);

    return () => {
      subscription.unsubscribe();
    };
  }, [view, wipman]);

  function handleTaskFilterChange(updated: FilterSpec): void {
    if (updated.query !== query) {
      setQuery(updated.query);
      setQueryInUrl(updated.query);
    }

    if (updated.showCompleted !== showCompleted) {
      setShowCompleted(updated.showCompleted);
    }
  }

  function handleInsertBefore({
    toInsert,
    before,
  }: {
    toInsert: TaskId;
    before: TaskId;
  }): void {
    // This happens during the first render of the component, and in the rare
    // case that the user manages to change things fast enough, you don't want
    // to set `view.tasks` to `[]`.
    if (taskIds.length === 0) {
      return;
    }

    const reorderedTasks: TaskId[] = insertBefore({
      list: taskIds,
      toInsert,
      before,
    });

    const updated: View = { ...view, tasks: reorderedTasks };
    wipman.updateView({ view: updated });

    // Needed to pick up the view.tasks change and re-render
    setTaskIds(reorderedTasks);
  }

  function openTask(id: TaskId): void {
    navigate(getTaskPath(id));
  }

  const tasks: Task[] = [];
  for (const taskId of taskIds) {
    const task = wipman.getTask({ id: taskId });
    if (task === undefined) {
      continue;
    }

    // If task is not completed, always show it
    // If task is completed, only show it if `showCompleted` is true
    const showByCompleted = task.completed === false || showCompleted === true;

    // optimization to avoid text search if not needed
    if (showByCompleted === false) continue;

    // Text search
    const showByFilter =
      query === NO_FILTER_QUERY || // show if user didn't use search
      shouldShowTask(task, query);

    const showTask = showByCompleted && showByFilter;
    if (showTask) {
      tasks.push(task);
    }
  }

  return (
    <>
      <TaskFilter
        spec={{ query, showCompleted }}
        onUpdate={handleTaskFilterChange}
      />
      <DndProvider backend={TouchBackend}>
        <ul>
          {tasks.map((task) => (
            <ListedTask
              key={task.id}
              task={task}
              onOpenTaskView={() => openTask(task.id)}
              onInsertBefore={handleInsertBefore}
            />
          ))}
        </ul>
      </DndProvider>
    </>
  );
}

interface InsertBeforeArgs {
  list: TaskId[];
  toInsert: TaskId;
  before: TaskId;
}
function insertBefore({ list, toInsert, before }: InsertBeforeArgs): TaskId[] {
  const newItems: TaskId[] = [];

  for (const item of list) {
    if (item === before) {
      newItems.push(toInsert);
      newItems.push(item);
      continue;
    }

    if (item === toInsert) {
      continue; // do nothing, it was already inserted
    }

    newItems.push(item);
  }

  return newItems;
}
