import { SettingsChange, SettingsManager } from "../../domain/settings";
import { TaskManager, mergeTasks } from "../../domain/task";
import { Settings, Task, TaskId, View } from "../../domain/types";
import { assertNever } from "../../exhaustive-match";
import { Storage as BrowserStorage } from "../../services/persistence/localStorage";
import { WipmanApi } from "../api";
import {
  BehaviorSubject,
  Observable,
  first,
  from,
  map,
  of,
  skip,
  zip,
} from "rxjs";

export enum StorageStatus {
  DRAFT = "draft",
  SAVING = "saving",
  SAVED = "saved",
}

interface StorageArgs {
  settingsManager: SettingsManager;
  browserStorage: BrowserStorage;
  api: WipmanApi;
  taskManager: TaskManager;
}

// TODO: use this class to persist either using browser-git, or whatever DB you want
export class Storage {
  public tasks: Map<TaskId, Task> = new Map(); // persisted tasks
  public draftTasks: Map<TaskId, Task> = new Map(); // in-memory tasks
  public status$: Observable<StorageStatus>;
  public lastBackendFetch: Date;

  private settings: SettingsManager;
  private taskManager: TaskManager;
  private browserStorage: BrowserStorage;
  private api: WipmanApi;
  private tasks$: Observable<Map<TaskId, Task>> | undefined;
  private lastStatus: StorageStatus = StorageStatus.SAVED;
  private statusSubject = new BehaviorSubject<StorageStatus>(
    StorageStatus.SAVED
  );

  constructor({
    settingsManager,
    taskManager,
    browserStorage,
    api,
  }: StorageArgs) {
    this.taskManager = taskManager;
    this.browserStorage = browserStorage;
    this.api = api;

    this.status$ = this.statusSubject.asObservable();

    this.settings = settingsManager;
    this.settings.change$.subscribe((change) =>
      this.handleSettingsChange(change)
    );

    this.lastBackendFetch = this.getLastFetchDate();
  }

  /**
   * Retrieve data stored in browser and in API.
   */
  public readAll(): Observable<{ tasks: Task[]; views: View[] }> {
    /**
     * Decision: do not emit first browser data and later API data, because if they
     * differ, the UI will show browser data for a second and the API data a bit later,
     * which creates a bumpy UI. This can confuse the user and promote the user tapping
     * where it does not intend. Just wait until the API emits too, and present all data
     * at once.
     */
    const tasksInBrowser: Task[] = this.readTasksFromBrowser();
    const fromBrowser$ = of<{ tasks: Task[]; views: View[] }>({
      tasks: tasksInBrowser,
      views: [],
    }); // emits browser data as soon as is available
    const fromApi$ = from(this.api.getLastChanges()); //     emits api     data as soon as is available -- if offline, emits immediately with nothing

    return zip(fromBrowser$.pipe(first()), fromApi$.pipe(first())).pipe(
      first(),
      map(([browserItems, apiItems]) => {
        const { tasks: browserTasks /*, views: browserViews */ } = browserItems;
        const { tasks: apiTasks /*, views: apiViews */ } = apiItems;

        const tasks = mergeTasks({ a: browserTasks, b: apiTasks });

        return { tasks, views: [] };
      })
    );
  }

  // Returns `false` if there are pending changes to save, else `true`.
  public changesSaved: boolean = true;

  public listenTasks(tasks: Observable<Map<TaskId, Task>>): void {
    this.tasks$ = tasks;

    /** TODO: think if it's easier to test when the subscription happens inside the
     * Storage instance or there is something else that does the wiring and the Storage
     * class only exposes a method that is called when new tasks are received
     */
    this.status$.subscribe((status) => {
      this.lastStatus = status;
    });

    // On first task emission (aka: loading from the default storage), do not change
    // status to DRAFT
    this.tasks$.pipe(first()).subscribe((tasks) => {
      this.draftTasks = tasks;
    });

    // On later task emissions, set status as required
    this.tasks$.pipe(skip(1)).subscribe((tasks) => {
      // Optimization: do not reemit if it's already DRAFT -----------------------------
      if (this.lastStatus !== StorageStatus.DRAFT) {
        this.changesSaved = false;
        console.debug('Storage.constructor - emitting "DRAFT"');
        this.statusSubject.next(StorageStatus.DRAFT);
      }
      // Optimization ------------------------------------------------------------------

      this.draftTasks = tasks;
    });
  }

  /**
   * The UI component will buffer all the changes locally until I exit the text bot, so
   * I won't spam the backend on each keystroke.
   *
   * Once the UI passes the changes to Wipman, wipman will persist in localstorage and
   * API.
   *
   * I don't think there is any benefit to having the save button now :S
   */
  public save(): void {
    console.debug("Storage.save: saving...");
    this.tasks = this.draftTasks;

    this.statusSubject.next(StorageStatus.SAVING);
    // this.saveTasksToBrowser();
    // this.saveTasksToBackend();

    // TODO: if something fails - report error to error service and keep as StorageStatus.DRAFT
    this.statusSubject.next(StorageStatus.SAVED);
  }

  /**
   * Read raw data from browser storage, cast data to domain types, and return it.
   */
  private readTasksFromBrowser(): Task[] {
    console.debug("Reading tasks from browser...");
    // TODO: return Result
    if (this.browserStorage.tasks.exists() === false) {
      return [];
    }

    const rawTasks = this.browserStorage.tasks.read() as SerializedTask[];
    if (!rawTasks) {
      return [];
    }

    const tasks = rawTasks.map(rawToTask);

    return tasks;
  }

  public readSettings(): Settings {
    console.debug(`Storage.readSettings::reading settings from browser...`);
    const noSettings = {};

    if (this.browserStorage.settings.exists() === false) {
      return noSettings;
    }

    const rawSettings = this.browserStorage.settings.read();
    if (rawSettings === undefined) {
      return noSettings;
    }

    const settings = rawToSettings(rawSettings);

    return settings;
  }

  private handleSettingsChange(change: SettingsChange): void {
    switch (change.kind) {
      case "SettingsInitialized":
        break; // do nothing
      case "ApiUrlUpdated":
        this.browserStorage.settings.set(this.settings.settings);
        break;
      case "ApiTokenUpdated":
        this.browserStorage.settings.set(this.settings.settings);
        break;
      default:
        assertNever(change, `Unsupported SettingsChange variant: ${change}`);
    }
  }

  private getLastFetchDate(): Date {
    if (this.browserStorage.lastBackendFetch.exists() === false) {
      console.log("Date of last API fetch not found in browser storage");
      return new Date(0); // old date in the past
    }

    const raw = this.browserStorage.lastBackendFetch.read() as string;

    return new Date(raw);
  }

  private updateLastFetchDate(date: Date): void {
    this.lastBackendFetch = date;
    this.browserStorage.lastBackendFetch.set(date.toISOString());
  }

  public addTask({ taskId }: { taskId: TaskId }): Observable<AddTaskProgress> {
    const $ = new Observable<AddTaskProgress>((observer) => {
      const task = this.taskManager.getTask(taskId);
      if (task === undefined) {
        observer.next({ kind: "FailedToRetrieveTaskById", taskId });
        observer.complete();
        return;
      }

      // While you use browser local storage - as opposed to IndexDB -, there is no way to
      // only update one task. Instead you need to update all the tasks object in local
      // storage. This is not true if you use IndexDB.
      this.saveAllTasksToBrowser();
      observer.next({ kind: "TaskAddedToBrowserStore", task });

      if (this.api.isOnline() === false) {
        observer.complete();
        return;
      }

      this.api
        .createTask({ task })
        .then((task) => {
          observer.next({ kind: "TaskAddedToApi", task });
        })
        .catch((reason) => {
          observer.next({ kind: "FailedToAddTaskToApi", task, reason });
        })
        .finally(() => observer.complete());
    });

    return $;
  }

  public updateTask({
    taskId,
  }: {
    taskId: TaskId;
  }): Observable<UpdateTaskProgress> {
    const $ = new Observable<UpdateTaskProgress>((observer) => {
      const task = this.taskManager.getTask(taskId);
      if (task === undefined) {
        observer.next({ kind: "FailedToRetrieveTaskById", taskId });
        observer.complete();
        return;
      }

      // While you use browser local storage - as opposed to IndexDB -, there is no way to
      // only update one task. Instead you need to update all the tasks object in local
      // storage. This is not true if you use IndexDB.
      this.saveAllTasksToBrowser();
      observer.next({ kind: "TaskUpdatedInBrowserStore", task });

      if (this.api.isOnline() === false) {
        observer.complete();
        return;
      }

      this.api
        .updateTask({ task })
        .then((task) => {
          observer.next({ kind: "TaskUpdatedInApi", task });
        })
        .catch((reason) => {
          observer.next({ kind: "FailedToUpdateTaskInApi", task, reason });
        })
        .finally(() => observer.complete());
    });

    return $;
  }

  public deleteTask({
    taskId,
  }: {
    taskId: TaskId;
  }): Observable<DeleteTaskProgress> {
    const $ = new Observable<DeleteTaskProgress>((observer) => {
      // TODO: temporary hack;
      this.saveAllTasksToBrowser();
      observer.next({ kind: "TaskDeletedFromBrowserStore", taskId });

      if (this.api.isOnline() === false) {
        observer.complete();
        return;
      }

      this.api
        .deleteTask({ taskId })
        .then((task) => {
          observer.next({ kind: "TaskDeletedFromApi", taskId });
        })
        .catch((reason) => {
          observer.next({
            kind: "FailedToDeleteTaskFromBrowserStore",
            taskId,
            reason,
          });
        })
        .finally(() => observer.complete());
    });

    return $;
  }

  /**
   * Read latest task data from the domain layer and persist the data
   */
  private saveAllTasksToBrowser(): void {
    // TODO: return Result
    console.debug("Storage::saveAllTasksToBrowser");
    const serializedTasks = [...this.taskManager.tasks.values()].map(taskToRaw);

    this.browserStorage.tasks.set(serializedTasks);
  }
}

function taskToRaw(task: Task): SerializedTask {
  const raw: SerializedTask = {
    id: task.id,
    title: task.title,
    content: task.content,
    created: task.created,
    updated: task.updated,
    tags: [...task.tags],
    blockedBy: [...task.blockedBy],
    blocks: [...task.blocks],
    completed: task.completed,
  };
  return raw;
}

interface SerializedTask {
  id: string;
  title: string;
  content: string;
  created: string;
  updated: string;
  tags: string[];
  blockedBy: string[];
  blocks: string[];
  completed: boolean;
}

function rawToTask(raw: SerializedTask) {
  const task: Task = {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    created: raw.created,
    updated: raw.updated,
    tags: new Set(raw.tags),
    blockedBy: new Set(raw.blockedBy),
    blocks: new Set(raw.blocks),
    completed: raw.completed,
  };
  return task;
}

interface SerializedSettings {
  apiUrl?: string;
  apiToken?: string;
}

function rawToSettings(raw: SerializedSettings) {
  const settings: Settings = { ...raw };
  return settings;
}

type AddTaskProgress =
  | { kind: "FailedToRetrieveTaskById"; taskId: TaskId }
  | { kind: "TaskAddedToBrowserStore"; task: Task }
  | { kind: "FailedToAddTaskToBrowserStore"; task: Task }
  | { kind: "TaskAddedToApi"; task: Task }
  | { kind: "FailedToAddTaskToApi"; task: Task; reason: any };

type UpdateTaskProgress =
  | { kind: "FailedToRetrieveTaskById"; taskId: TaskId }
  | { kind: "TaskUpdatedInBrowserStore"; task: Task }
  | { kind: "FailedToUpdateTaskInBrowserStore"; task: Task }
  | { kind: "TaskUpdatedInApi"; task: Task }
  | { kind: "FailedToUpdateTaskInApi"; task: Task; reason: any };

type DeleteTaskProgress =
  | { kind: "TaskDeletedFromBrowserStore"; taskId: TaskId }
  | { kind: "TaskDeletedFromApi"; taskId: TaskId }
  | { kind: "FailedToDeleteTaskFromBrowserStore"; taskId: TaskId; reason: any };
