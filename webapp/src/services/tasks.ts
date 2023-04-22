import { TaskManager } from "../domain/task";
import { Tag, Task, TaskId } from "../domain/types";
import storage from "./persistence/persist";
import { Observable, Subject } from "rxjs";

/**
 * TODO
 * on start up:
 *  1. load tasks from browser
 *  2. load tasks from remote DB
 *
 * task manager: persistence agnostic - data in memory
 * storage:
 *  - it's just an adaptor for parallel storages
 *  - listen to task manager (in-memory) data changes and persist in the background
 *  - collect data and hand it over to task manager on start
 *
 * on start:
 *   - UI subscribes to TaskManager
 *   - TaskManager requests data to Storage <--- NO, see (1)
 *   - Storage reads from browser
 *   - Storage returns to TaskManager
 *   - TaskManager emits new state
 *   - UI receives new state and rerenders
 *
 * 1: this means that TaskManager knows about Storage, but you want to keep TaskManger
 *    decoupled from Storage to improve make it more testable.
 *
 * on start:
 *   - UI subscribes to TaskManager
 *   - some initialization logic requests data to Storage
 *   - Storage reads from browser
 *   - Storage returns to some initialization logic
 *   - some initialization logic does a bulk data load in TaskManager
 *   - TaskManager emits new state
 *   - UI receives new state and rerenders
 *
 * "some initialization logic" could be a function in the Domain - separate from the
 * TaskManager and ViewManager - that could be called by the UI when the UI decides to
 * do so. This way, the UI can show spinners, while loading data async in the background
 *
 * ON START:
 *   - UI subscribes to TaskManager
 *   - UI subscribes to domain initialization observable (OIO)
 *   - OIO subscribes to Storage observable (SO)
 * ON START: loading from browser
 *   - OIO requests browser data to Storage - as opposed to via TaskManager (only for initialization)
 *   - SO emits ('reading data from browser', null)
 *   - OIO emits 'reading data from browser'
 *   - UI starts spinner
 *   - SO reads data from browser
 *   - SO emits ('data from browser read', <data>)
 *   - OIO receives data and bulk-loads data load in TaskManager
 *   - OIO emits 'data from browser loaded'
 *   - UI stops spinner
 *   - TaskManager emits new state
 *   - UI receives new state via TaskManager subscription and renders tasks
 * ON START: loading from API
 *   - OIO requests API data to Storage - as opposed to via TaskManager (only for initialization)
 *   - SO emits ('reading data from API', null)
 *   - OIO emits 'reading data from API'
 *   - SO reads data from API
 *   - SO emits ('data from API read', <data>)
 *   - OIO receives data and bulk-loads data load in TaskManager
 *   - OIO emits 'data from API loaded'
 *   - UI stops spinner
 *   - TaskManager emits new state
 *   - UI receives new state via TaskManager subscription and renders tasks
 * ON START: after loading data
 *   - cancel subscriptions
 *   - Store subscribes to TaskManager -- to persist any in-memory editions
 */

// TODO: read this from storage
const SAMPLE_TASKS: Task[] = [
  {
    id: "aaaaaaa",
    title: "task 1 title",
    content: "# Task 1 header\nThis is the best **markdown** content",
    created: "2022-09-05T10:21:45+01:00",
    updated: "2022-09-05T10:21:45+01:00",
    tags: new Set<Tag>(["hiru", "foo"]),
    blockedBy: new Set<TaskId>(),
    blocks: new Set<TaskId>(),
  },
  {
    id: "bbbbbbb",
    title: "task 2 title",
    content: "# Task 2 header\nThis is the best **markdown** content",
    created: "2022-09-05T10:23:12+01:00",
    updated: "2022-09-05T10:23:12+01:00",
    tags: new Set<Tag>(),
    blockedBy: new Set<TaskId>(),
    blocks: new Set<TaskId>(),
  },
];

// console.log(JSON.stringify(SAMPLE_TASKS));

const taskMap = new Map<TaskId, Task>();
SAMPLE_TASKS.forEach((task) => {
  taskMap.set(task.id, task);
});

// const taskManager = new TaskManager({ tasks: taskMap });
const taskManager = new TaskManager({});
export default taskManager;

// TODO: is this really only a TASK initialization status? or it initializes all data?
export enum TaskInitializationStatus {
  browserLoadStarted = "browserLoadStarted",
  browserLoadCompleted = "browserLoadCompleted",
  backendLoadStarted = "backendLoadStarted",
  backendLoadCompleted = "backendLoadCompleted",
  loadCompleted = "loadCompleted",
}

class TaskInitializationService {
  public status$: Observable<TaskInitializationStatus>;
  private status: Subject<TaskInitializationStatus>;
  private taskManager: TaskManager;
  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
    this.status = new Subject();
    this.status$ = this.status.asObservable();
  }

  public async initialize(): Promise<void> {
    // During the initial load, the storage layer is the source of truth. Once the
    // persisted data is loaded, the domain layer becomes the source of truth, and the
    // storage layer reacts to domain state changes.

    // Enable logging
    console.log("Starting initialization...");
    this.status.subscribe({
      next: (status) => {
        console.log(`TaskInitializationService.status$ = ${status}`);
      },
      error: (error) => console.error(error),
      complete: () =>
        console.log(`TaskInitializationService.status$ is now complete`),
    });

    this.status.next(TaskInitializationStatus.browserLoadStarted);
    const browserTasks = storage.readTasksFromBrowser();
    this.taskManager.bulkLoadTasks({ tasks: browserTasks, publish: false });
    this.status.next(TaskInitializationStatus.browserLoadCompleted);

    // TODO: remove
    // this is temporary: under normal circumstances, tasks are published once the
    // backend tasks are loaded. However, the backend load is not implemented yet. Until
    // then, publish tasks once they are loaded from the browser.
    // this.taskManager.publishTasks();

    // load from API
    this.status.next(TaskInitializationStatus.backendLoadStarted);
    let apiTasks: Task[];
    try {
      apiTasks = await storage.readTasksFromBackend(); // TODO: return result and handle failure
    } catch (error) {
      // TODO: if API load fails, use taskManager to publish tasks (to work offline)
      console.error(error);
      console.log("foo");
      this.taskManager.publishTasks();
      this.status.next(TaskInitializationStatus.loadCompleted);
      this.status.complete();
      return;
    }

    this.taskManager.bulkLoadTasks({ tasks: apiTasks, publish: true });
    this.status.next(TaskInitializationStatus.backendLoadCompleted);

    console.debug("Configuring storage to react to TaskManager...");
    storage.listenTasks(taskManager.tasks$);

    this.status.next(TaskInitializationStatus.loadCompleted);
    this.status.complete();
    console.log("complete!!");
  }
}

export const taskInitializationService = new TaskInitializationService(
  taskManager
);
