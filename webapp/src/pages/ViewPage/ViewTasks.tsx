import ListedTask from "../../components/ListedTask";
import { unreachable } from "../../devex";
import { Task, TaskId, View } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { getTaskPath } from "../../routes";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { useNavigate } from "react-router-dom";

interface ViewTasksProps {
  view: View;
  wipman: Wipman;
}
export function ViewTasks({ view, wipman }: ViewTasksProps) {
  const navigate = useNavigate();
  const [taskIds, setTaskIds] = useState<TaskId[]>([]);

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

  return (
    <DndProvider backend={TouchBackend}>
      <ul>
        {taskIds
          .map((id: TaskId) => wipman.getTask({ id }) as Task)
          .map((task) => (
            <ListedTask
              key={task.id}
              task={task}
              onOpenTaskView={() => openTask(task.id)}
              onInsertBefore={handleInsertBefore}
            />
          ))}
      </ul>
    </DndProvider>
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
