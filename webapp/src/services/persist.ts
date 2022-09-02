import { Task, TaskId } from "../domain/types";
import taskManager from "./tasks";
import { first, skip } from "rxjs";
import { BehaviorSubject, Observable } from "rxjs";

export enum StorageStatus {
  DRAFT = "draft",
  SAVING = "saving",
  SAVED = "saved",
}

interface StorageProps {
  tasks: Observable<Map<TaskId, Task>>;
}

// TODO: use this class to persist either using browser-git, or whatever DB you want
class Storage {
  public tasks: Map<TaskId, Task> = new Map(); // persisted tasks
  public draftTasks: Map<TaskId, Task> = new Map(); // in-memory tasks
  public status$: Observable<StorageStatus>;

  private tasks$: Observable<Map<TaskId, Task>>;
  private lastStatus: StorageStatus = StorageStatus.SAVED;
  private stores: Store[] = [];
  public statusSubject = new BehaviorSubject<StorageStatus>(
    StorageStatus.SAVED
  );

  constructor({ tasks }: StorageProps) {
    this.tasks$ = tasks;
    this.status$ = this.statusSubject.asObservable();

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
      // Optimization: do not reemit if it's already DRAFT
      if (this.lastStatus !== StorageStatus.DRAFT) {
        this.changesSaved = false;
        console.debug('Storage.constructor - emitting "DRAFT"');
        this.statusSubject.next(StorageStatus.DRAFT);
      }

      this.draftTasks = tasks;
    });
  }

  // Returns `false` if there are pending changes to save, else `true`.
  public changesSaved: boolean = true;

  public save(): void {
    console.debug("Storage.save: saving...");
    this.tasks = this.draftTasks;

    this.statusSubject.next(StorageStatus.SAVING);
    // TODO: save tasks to localstorage

    this.stores.forEach((store) => {
      console.debug(`Storage.save: saving to ${store.name}`);
      store.save({
        tasks: this.tasks,
        // views: this.views,
      });
    });

    // TODO: save tasks to git thingy  - this probably should be a s
    // tasksToGitRepo(gitClient, this.tasks)

    // TODO: if something fails - report error to error service and keep as StorageStatus.DRAFT
    this.statusSubject.next(StorageStatus.SAVED);
  }

  public registerStore(client: Store): void {
    this.stores.push(client);
  }
}

const storage = new Storage({ tasks: taskManager.tasks$ });

export default storage;

interface StorableData {
  tasks: Map<TaskId, Task>;
  // views: TODO
}
interface Store {
  name: string; // 'git', 'localStore'
  save: (data: StorableData) => void; // TODO: return Result
}
