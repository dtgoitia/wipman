import SearchBox, { NO_FILTER_QUERY } from "../../../components/SearchBox";
import { Task, TaskId } from "../../../domain/types";
import { Wipman } from "../../../domain/wipman";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  task: Task;
  wipman: Wipman;
}

export function TaskDependencies({ task, wipman }: Props) {
  const blockedTasks: Task[] = [];
  const blockedByTasks: Task[] = [];

  for (const blockedId of task.blocks) {
    const blocked = wipman.getTask({ id: blockedId });
    if (blocked === undefined) {
      console.warn(
        `${TaskDependencies.name}: Task ${blockedId} not found when trying to retrieve` +
          ` its data to build list of blocked Tasks`
      );
      continue;
    }
    blockedTasks.push(blocked);
  }

  for (const blockedId of task.blockedBy) {
    const blockedBy = wipman.getTask({ id: blockedId });
    if (blockedBy === undefined) {
      console.warn(
        `${TaskDependencies.name}: Task ${blockedId} not found when trying to retrieve` +
          ` its data to build list of blocked Tasks`
      );
      continue;
    }
    blockedByTasks.push(blockedBy);
  }

  function addBlockedTask(related: TaskId): void {
    const blockedTasks = new Set<TaskId>([...task.blocks.values()]);
    blockedTasks.add(related);

    const updated: Task = { ...task, blocks: blockedTasks };
    wipman.updateTask({ task: updated });
  }

  function addBlockingTask(related: TaskId): void {
    const blockedByTasks = new Set<TaskId>([...task.blockedBy.values()]);
    blockedByTasks.add(related);

    const updated: Task = { ...task, blockedBy: blockedByTasks };
    wipman.updateTask({ task: updated });
  }

  function removeBlockedTask(related: TaskId): void {
    const blockedTasks = new Set<TaskId>([...task.blocks.values()]);
    blockedTasks.delete(related);

    const updated: Task = { ...task, blocks: blockedTasks };
    wipman.updateTask({ task: updated });
  }

  function removeBlockingTask(related: TaskId): void {
    const blockedByTasks = new Set<TaskId>([...task.blockedBy.values()]);
    blockedByTasks.delete(related);

    const updated: Task = { ...task, blockedBy: blockedByTasks };
    wipman.updateTask({ task: updated });
  }

  return (
    <Container>
      <h4>Blocked by</h4>
      {blockedByTasks.map((task) => (
        <Relationship
          key={task.id}
          related={task}
          onRemove={() => removeBlockingTask(task.id)}
        />
      ))}
      <AddRelation wipman={wipman} onAdd={addBlockingTask} />

      <h4>Blocks</h4>
      {blockedTasks.map((task) => (
        <Relationship
          key={task.id}
          related={task}
          onRemove={() => removeBlockedTask(task.id)}
        />
      ))}
      <AddRelation wipman={wipman} onAdd={addBlockedTask} />
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
