import SearchBox, { NO_FILTER_QUERY } from "../../../components/SearchBox";
import {
  addBlockedTask,
  addBlockingTask,
  removeBlockedTask,
  removeBlockingTask,
} from "../../../lib/domain/task";
import { Task, TaskId } from "../../../lib/domain/types";
import { Wipman } from "../../../lib/domain/wipman";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  taskId: TaskId;
  wipman: Wipman;
}

export function TaskDependencies({ taskId, wipman }: Props) {
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [blockedTasks, setBlockedTasks] = useState<Task[]>([]);
  const [blockedByTasks, setBlockedByTasks] = useState<Task[]>([]);

  function loadTaskDependencies(): void {
    const task = wipman.getTask({ id: taskId });
    if (task === undefined) {
      console.warn(
        `${TaskDependencies.name}.${loadTaskDependencies.name}::no task found` +
          ` with ID ${taskId}`
      );
      return;
    }

    setTask(task);
    setBlockedTasks(wipman.getBlockedTasks({ task }));
    setBlockedByTasks(wipman.getBlockingTasks({ task }));
  }

  useEffect(() => {
    const subscription = wipman.taskManager.change$.subscribe((change) => {
      switch (change.kind) {
        case "TaskUpdated":
          loadTaskDependencies();
          break;
        default:
        // ...
      }
    });

    loadTaskDependencies();

    return () => {
      subscription.unsubscribe();
    };
  }, [taskId, wipman]);

  function handleBlockedTaskAddition(blocked: TaskId): void {
    if (task === undefined) return;
    const updated = addBlockedTask({ task, blocked });
    wipman.updateTask({ task: updated });
  }

  function handleBlockingTaskAddition(blocking: TaskId): void {
    if (task === undefined) return;
    const updated = addBlockingTask({ task, blocker: blocking });
    wipman.updateTask({ task: updated });
  }

  function handleBlockedTaskRemoval(blocked: TaskId): void {
    if (task === undefined) return;
    const updated = removeBlockedTask({ task, blocked });
    wipman.updateTask({ task: updated });
  }

  function handleBlockingTaskRemoval(blocking: TaskId): void {
    if (task === undefined) return;
    const updated = removeBlockingTask({ task, blockerId: blocking });
    wipman.updateTask({ task: updated });
  }

  return (
    <Container>
      <h4>Blocked by</h4>
      {blockedByTasks.map((task) => (
        <Relationship
          key={task.id}
          related={task}
          onRemove={() => handleBlockingTaskRemoval(task.id)}
        />
      ))}
      <AddRelation wipman={wipman} onAdd={handleBlockingTaskAddition} />

      <h4>Blocks</h4>
      {blockedTasks.map((task) => (
        <Relationship
          key={task.id}
          related={task}
          onRemove={() => handleBlockedTaskRemoval(task.id)}
        />
      ))}
      <AddRelation wipman={wipman} onAdd={handleBlockedTaskAddition} />
    </Container>
  );
}

const Container = styled.div`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

interface RelationshipProps {
  related: Task;
  onRemove: () => void;
}
function Relationship({ related, onRemove: handleRemove }: RelationshipProps) {
  return (
    <RelationshipContainer>
      {related.title}
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-sm"
        onClick={handleRemove}
      />
    </RelationshipContainer>
  );
}

const RelationshipContainer = styled.div`
  border: 1px solid #333;
  margin: 0.5rem;
`;

interface AddRelationProps {
  wipman: Wipman;
  onAdd: (related: TaskId) => void;
}

function AddRelation({ wipman, onAdd }: AddRelationProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>(NO_FILTER_QUERY);

  useEffect(() => {
    const subscription = wipman.tasks$.subscribe((taskMap) => {
      const unsortedTasks: Task[] = [...taskMap.values()];
      setTasks(unsortedTasks);
    });

    return () => subscription.unsubscribe();
  }, [wipman]);

  function handleSelectRelatedTask(id: TaskId): void {
    setIsOpen(false);
    setQuery(NO_FILTER_QUERY);
    onAdd(id);
  }

  // If a task has been selected, do not show any task
  const filtered = filterTasks({ tasks, criteria: query });
  const tasksNotFound = filtered.length === 0 && query !== NO_FILTER_QUERY;

  return (
    <AddRelationContainer>
      <Button
        icon="pi pi-times"
        label="select related task"
        className="p-button-rounded p-button-text p-button-sm"
        onClick={() => setIsOpen(true)}
      />

      <Dialog
        header="select a related task"
        visible={isOpen}
        dismissableMask
        // footer={}
        onHide={() => setIsOpen(false)}
      >
        <SearchBox
          query={query}
          placeholder="Type to find a task..."
          onChange={(value) => setQuery(value || NO_FILTER_QUERY)}
          clearSearch={() => setQuery(NO_FILTER_QUERY)}
        />

        <div>
          {tasksNotFound
            ? "no tasks found"
            : filtered.map((task) => (
                <RelatedTask
                  key={task.id}
                  onClick={() => handleSelectRelatedTask(task.id)}
                >
                  {task.title}
                </RelatedTask>
              ))}
        </div>
      </Dialog>
    </AddRelationContainer>
  );
}

const AddRelationContainer = styled.div`
  margin: 0.5rem;
`;

const RelatedTask = styled.div`
  padding: 0.5rem;
`;

function filterTasks({
  tasks,
  criteria,
}: {
  tasks: Task[];
  criteria: string;
}): Task[] {
  if (criteria === NO_FILTER_QUERY) {
    return [];
  }

  const result: Task[] = [];

  for (const task of tasks) {
    const isAMatch = [task.id, task.title, task.content]
      .join(" ")
      .includes(criteria);

    if (isAMatch) {
      result.push(task);
    }
  }

  return result;
}
