import AddTask from "../components/AddTask";
import CenteredPage from "../components/CenteredPage";
import ListedTask from "../components/ListedTask";
import SearchBox, { NO_FILTER_QUERY } from "../components/SearchBox";
import { FilterQuery, Task, TaskId, TaskTitle } from "../domain/types";
import { Wipman } from "../domain/wipman";
import { getTaskPath } from "../routes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TaskExplorerProps {
  wipman: Wipman;
}
function TaskExplorer({ wipman }: TaskExplorerProps) {
  const navigateTo = useNavigate();

  const [query, setQuery] = useState<FilterQuery>(NO_FILTER_QUERY);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const subscription = wipman.tasks$.subscribe((taskMap) => {
      const unsortedTasks: Task[] = [...taskMap.values()];
      console.log(`TaskExplorer::wipman.tasks$ emitted latest task list`);
      setTasks(unsortedTasks);
    });

    return subscription.unsubscribe;
  }, [wipman]);

  function openTask(id: TaskId): void {
    navigateTo(getTaskPath(id));
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
