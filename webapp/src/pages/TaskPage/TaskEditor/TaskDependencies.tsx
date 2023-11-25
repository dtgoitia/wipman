import { useWipman } from "../../..";
import SearchBox, { NO_FILTER_QUERY } from "../../../components/SearchBox";
import { Task, TaskId } from "../../../lib/domain/types";
import { Wipman } from "../../../lib/domain/wipman";
import { getTaskPath } from "../../../routes";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface Props {
  blockedBy: Set<TaskId>;
  addBlockedBy: (id: TaskId) => void;
  deleteBlockedBy: (id: TaskId) => void;

  blocks: Set<TaskId>;
  addBlocks: (id: TaskId) => void;
  deleteBlocks: (id: TaskId) => void;
}

export function TaskDependencies({
  blockedBy,
  blocks,
  addBlockedBy,
  deleteBlockedBy,
  addBlocks,
  deleteBlocks,
}: Props) {
  const wipman = useWipman();

  const blockedByTasks: Task[] = getTasks({ ids: [...blockedBy], wipman });
  const blocksTasks: Task[] = getTasks({ ids: [...blocks], wipman });

  return (
    <Container>
      <h4>Blocked by</h4>
      {blockedByTasks.map((task) => (
        <Relationship
          key={task.id}
          related={task}
          onRemove={() => deleteBlockedBy(task.id)}
        />
      ))}
      <AddRelation onAdd={addBlockedBy} />

      <h4>Blocks</h4>
      {blocksTasks.map((task) => (
        <Relationship
          key={task.id}
          related={task}
          onRemove={() => deleteBlocks(task.id)}
        />
      ))}
      <AddRelation onAdd={addBlocks} />
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
      <Link to={getTaskPath(related.id)}>{related.title}</Link>

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
  onAdd: (related: TaskId) => void;
}

function AddRelation({ onAdd }: AddRelationProps) {
  const wipman = useWipman();

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

function getTasks({ ids, wipman }: { ids: TaskId[]; wipman: Wipman }): Task[] {
  const result: Task[] = [];

  for (const id of ids) {
    const task = wipman.taskManager.getTask(id);
    if (task === undefined) continue;
    result.push(task);
  }

  return result;
}
