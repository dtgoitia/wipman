import { Task, TaskId } from "../../domain/types";
import { DynamoDbClient, getClient } from "./dynamodb";
import browserStorage from "./localStorage";
import { first, skip } from "rxjs";
import { BehaviorSubject, Observable } from "rxjs";

export enum StorageStatus {
  DRAFT = "draft",
  SAVING = "saving",
  SAVED = "saved",
}

// TODO: use this class to persist either using browser-git, or whatever DB you want
class Storage {
  public tasks: Map<TaskId, Task> = new Map(); // persisted tasks
  public draftTasks: Map<TaskId, Task> = new Map(); // in-memory tasks
  public status$: Observable<StorageStatus>;
  public lastBackendFetch: Date;

  private tasks$: Observable<Map<TaskId, Task>> | undefined;
  private lastStatus: StorageStatus = StorageStatus.SAVED;
  public statusSubject = new BehaviorSubject<StorageStatus>(
    StorageStatus.SAVED
  );

  private dynamoDbClient: DynamoDbClient;

  constructor() {
    this.status$ = this.statusSubject.asObservable();

    // TODO: load these from localstorage
    const [url, region] = ["http://localhost:8000", "localhost"];
    this.dynamoDbClient = getClient({ url, region });

    this.lastBackendFetch = this.getLastFetchDate();
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

  public save(): void {
    console.debug("Storage.save: saving...");
    this.tasks = this.draftTasks;

    this.statusSubject.next(StorageStatus.SAVING);
    this.saveTasksToBrowser();
    this.saveTasksToBackend();

    // TODO: if something fails - report error to error service and keep as StorageStatus.DRAFT
    this.statusSubject.next(StorageStatus.SAVED);
  }

  /**
   * Read raw data from browser storage, cast data to domain types, and return it.
   */
  public readTasksFromBrowser(): Task[] {
    console.debug("Reading tasks from browser...");
    // TODO: return Result
    if (browserStorage.tasks.exists() === false) {
      return [];
    }

    const rawTasks = browserStorage.tasks.read() as SerializedTask[];
    if (!rawTasks) {
      return [];
    }

    const tasks = rawTasks.map(rawToTask);

    return tasks;
  }

  // TODO: return Result
  public readTasksFromBackend(): Promise<Task[]> {
    return this.dynamoDbClient
      .getTasksUpdatedAfter(this.lastBackendFetch)
      .then((result) => {
        this.updateLastFetchDate(new Date());
        return result;
      });
  }

  private getLastFetchDate(): Date {
    if (browserStorage.lastBackendFetch.exists() === false) {
      console.log("Date of last API fetch not found in browser storage");
      return new Date(0); // old date in the past
    }

    const raw = browserStorage.lastBackendFetch.read() as string;

    return new Date(raw);
  }

  private updateLastFetchDate(date: Date): void {
    this.lastBackendFetch = date;
    browserStorage.lastBackendFetch.set(date.toISOString());
  }

  /**
   * Read latest task data from the domain layer and persist the data
   */
  private saveTasksToBrowser(): void {
    // TODO: return Result
    console.debug("Storage::saveTasksToBrowser");
    const serializedTasks = [...this.tasks.values()].map(taskToRaw);

    browserStorage.tasks.set(serializedTasks);
  }

  private saveTasksToBackend(): void {
    // TODO: return Result
    /**
     * TODO:
     * Phase 1: save everything in browser to DynamoDB - super inefficient
     * Phase 2: save only the items changed in browser to DynamoDB - optimal
     */
    console.debug("Storage::saveTasksToBackend");
    const tasks = [...this.tasks.values()];
    if (tasks.length > 25) {
      /**
       * TODO
       * DynamoDB supports up to 25 items up to 400KB each, or a maximum of 16MB for the
       * bulk write request (whichever occurs first) per API call.
       * Source: https://dynobase.dev/dynamodb-batch-write-update-delete/
       */
      throw new Error(
        `Apparently DynamoDB doesn't support more than 25 items per batch write, have a look and see if that's true`
      );
    }
    this.dynamoDbClient.addTasks(tasks);
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
  };
  return task;
}

// const storage = new Storage({ tasks: taskManager.tasks$ });
const storage = new Storage();

export default storage;
