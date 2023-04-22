import AddTask from "../components/AddTask";
import CenteredPage from "../components/CenteredPage";
import ListedTask from "../components/ListedTask";
import { Task, TaskId } from "../domain/types";
import { getTaskPath } from "../routes";
import { errorsService } from "../services/errors";
import taskManager, {
  taskInitializationService,
  TaskInitializationStatus,
} from "../services/tasks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TaskExplorer() {
  // TODO: action: open task view
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  // TODO: do we even care about showing the spinner? -- maybe when we are updating one task?
  const [showSpinner, setShowSpinner] = useState(true);
  console.log(showSpinner);

  useEffect(() => {
    // en este punto, el manager está vacío, pásaselo a la function del domain que va a
    // fetch the tasks from localstorage and bulk load them to the task manager

    const subscription = taskManager.tasks$.subscribe((taskMap) => {
      const unsortedTasks: Task[] = [...taskMap.values()];
      console.log(`TaskExplorer::taskManager.tasks$ emitted latest task list`);
      setTasks(unsortedTasks);
    });

    return subscription.unsubscribe;
  }, []);

  useEffect(() => {
    const initSubscription = taskInitializationService.status$.subscribe(
      (status) => {
        console.debug(`init status: ${status}`);

        switch (status) {
          case TaskInitializationStatus.browserLoadStarted:
            setShowSpinner(true);
            break;
          case TaskInitializationStatus.browserLoadCompleted:
            setShowSpinner(false);
            break;
          case TaskInitializationStatus.backendLoadStarted:
            setShowSpinner(true);
            break;
          case TaskInitializationStatus.backendLoadCompleted:
            setShowSpinner(false);
            break;
          default:
            throw new Error("Did not expect to reach this line of code");
        }
      }
    );

    return initSubscription.unsubscribe;

    // TODO: start spinner
    // const fetchFromApi = async () => {
    //   const updatedTasks = await ApiClient.getTasks({ after: lastUpdate });
    //   taskManager.bulkLoadTasks(updatedTasks, true);
    //   // TODO: stop spinner
    // };
    // fetchFromApi().catch((error) =>
    //   errorsService.add({
    //     header: "Failed to load tasks from API",
    //     description: error,
    //   })
    // );
  }, []);

  function openTask(id: TaskId): void {
    navigate(getTaskPath(id));
  }

  function addTask(title: string): void {
    taskManager.addTask({ title });
  }

  if (taskManager.tasks.size === 0) {
    return (
      <CenteredPage>
        <div>No tasks here</div>
        <AddTask onAdd={addTask} />
      </CenteredPage>
    );
  }

  return (
    <CenteredPage>
      <ul>
        {tasks.map((task) => (
          <ListedTask
            key={task.id}
            task={task}
            onOpenTaskView={() => openTask(task.id)}
            onRemoveTask={() => taskManager.removeTask(task.id)}
          />
        ))}
      </ul>
      <AddTask onAdd={addTask} />
    </CenteredPage>
  );
}

export default TaskExplorer;
