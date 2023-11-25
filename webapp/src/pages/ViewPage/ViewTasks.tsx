import { useWipman } from "../..";
import { DraggableListedTask } from "../../components/DraggableListedTask";
import { NO_FILTER_QUERY } from "../../components/SearchBox";
import { isMobile } from "../../device";
import { unreachable } from "../../lib/devex";
import { nowIsoString } from "../../lib/domain/dates";
import {
  FilterQuery,
  FilterSpec,
  Task,
  TaskId,
  View,
} from "../../lib/domain/types";
import { useUrlSearchParams } from "../../navigation";
import { getTaskPath } from "../../routes";
import { TaskFilter } from "../TaskExplorer/TaskFilter";
import { shouldShowTask } from "../TaskExplorer/filter";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  margin-bottom: 3rem;
`;

interface Props {
  view: View;
}

export function ViewTasks({ view }: Props) {
  const navigate = useNavigate();
  const wipman = useWipman();
  const [filterSpecInUrl, setFilterSpecInUrl] = useUrlSearchParams();

  const [taskIds, setTaskIds] = useState<TaskId[]>([]);
  const [showCompleted, setShowCompleted] = useState<boolean>(
    filterSpecInUrl.showCompleted || false
  );
  const [query, setQuery] = useState<FilterQuery>(
    filterSpecInUrl.query || NO_FILTER_QUERY
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
    }

    if (updated.showCompleted !== showCompleted) {
      setShowCompleted(updated.showCompleted);
    }

    setFilterSpecInUrl(updated);
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

    // If the user drops the dragged item in the same place where it was
    if (toInsert === before) {
      return;
    }

    const reorderedTasks: TaskId[] = insertBefore({
      list: taskIds,
      toInsert,
      before,
    });

    const updated: View = {
      ...view,
      tasks: reorderedTasks,
      updated: nowIsoString(),
    };
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
    <Container>
      <TaskFilter
        spec={{ query, showCompleted }}
        onUpdate={handleTaskFilterChange}
      />
      <DndProvider backend={isMobile() ? TouchBackend : HTML5Backend}>
        <ul>
          {tasks.map((task) => (
            <DraggableListedTask
              key={task.id}
              task={task}
              onOpenTaskView={() => openTask(task.id)}
              onInsertBefore={handleInsertBefore}
            />
          ))}
        </ul>
      </DndProvider>
    </Container>
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
