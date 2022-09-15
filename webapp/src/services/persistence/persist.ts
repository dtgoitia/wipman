import { Task, TaskId } from "../../domain/types";
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

  private tasks$: Observable<Map<TaskId, Task>> | undefined;
  private lastStatus: StorageStatus = StorageStatus.SAVED;
  public statusSubject = new BehaviorSubject<StorageStatus>(
    StorageStatus.SAVED
  );

  constructor() {
    this.status$ = this.statusSubject.asObservable();
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

    // TODO: save tasks to git thingy  - this probably should be a s
    // tasksToGitRepo(gitClient, this.tasks)

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

  public readTasksFromBackend(): Task[] {
    // TODO: return Result
    // ..
    return [];
  }

  /**
   * Read latest task data from the domain layer and persist the data
   */
  private saveTasksToBrowser(): void {
    // TODO: return Result
    // TODO: read latest tasks from domain and persist them to
    console.log("Storage::saveTasksToBrowser");
    const serializedTasks = [...this.tasks.values()].map(taskToRaw);

    browserStorage.tasks.set(serializedTasks);
  }

  private saveTasksToBackend(): void {
    // TODO: return Result
    // ..
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
