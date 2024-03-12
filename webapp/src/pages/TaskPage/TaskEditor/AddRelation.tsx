import { useWipman } from "../../..";
import SearchBox, { NO_FILTER_QUERY } from "../../../components/SearchBox";
import { Task, TaskId } from "../../../lib/domain/types";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface AddRelationProps {
  text: string;
  onAdd: (related: TaskId) => void;
  exclude: Set<TaskId>;
}

export function AddRelation({ text, onAdd, exclude }: AddRelationProps) {
  const wipman = useWipman();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>(NO_FILTER_QUERY);

  useEffect(() => {
    const subscription = wipman.tasks$.subscribe((taskMap) => {
      const unsortedTasks: Task[] = [...taskMap.values()].filter(
        (task) => exclude.has(task.id) === false
      );
      setTasks(unsortedTasks);
    });

    return () => subscription.unsubscribe();
  }, [wipman, exclude]);

  function handleSelectRelatedTask(id: TaskId): void {
    setIsOpen(false);
    setQuery(NO_FILTER_QUERY);
    onAdd(id);
  }

  function closeDialog(): void {
    setIsOpen(false);
    setQuery(NO_FILTER_QUERY);
  }

  // If a task has been selected, do not show any task
  const filtered = filterTasks({ tasks, criteria: query });
  const tasksNotFound = filtered.length === 0 && query !== NO_FILTER_QUERY;

  return (
    <AddRelationContainer>
      <Button
        icon="pi pi-times"
        label={text}
        className="p-button-rounded p-button-text p-button-sm"
        onClick={() => setIsOpen(true)}
      />

      <SearchBoxDialog
        header="select a related task"
        visible={isOpen}
        dismissableMask
        // footer={}
        onHide={closeDialog}
      >
        <SearchBox
          query={query}
          placeholder="Type to find a task..."
          onChange={(value) => setQuery(value || NO_FILTER_QUERY)}
          clearSearch={() => setQuery(NO_FILTER_QUERY)}
        />

        <SearchResults>
          {tasksNotFound ? (
            <SearchResult>no tasks found</SearchResult>
          ) : (
            filtered.map((task) => (
              <SearchResult
                key={task.id}
                onClick={() => handleSelectRelatedTask(task.id)}
              >
                {task.title}
              </SearchResult>
            ))
          )}
        </SearchResults>
      </SearchBoxDialog>
    </AddRelationContainer>
  );
}

const AddRelationContainer = styled.div`
  margin: 0.5rem;
`;

const SearchBoxDialog = styled(Dialog)`
  width: 100vh;
`;

const SearchResults = styled.div`
  margin-top: 0.7rem;
`;

const SearchResult = styled.div`
  padding: 0.5rem;
`;

function filterTasks({
  tasks,
  criteria: rawCriteria,
}: {
  tasks: Task[];
  criteria: string;
}): Task[] {
  if (rawCriteria === NO_FILTER_QUERY) {
    return [];
  }

  const criteria = rawCriteria.toLowerCase();

  const result: Task[] = [];
  for (const task of tasks) {
    const isAMatch = [
      task.id,
      task.title.toLowerCase(),
      task.content.toLowerCase(),
    ]
      .join(" ")
      .includes(criteria);

    if (isAMatch) {
      result.push(task);
    }
  }

  return result;
}
