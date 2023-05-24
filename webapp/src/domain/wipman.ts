import { assertNever } from "../exhaustive-match";
import { ErrorsService } from "../services/errors";
import { Storage } from "../services/persistence/persist";
import { Admin } from "./admin";
import {
  OperationId,
  OperationStatusChange,
  OperationsManager,
  generateOperationId,
} from "./operations";
import { SettingsManager } from "./settings";
import { TaskChanges, TaskManager } from "./task";
import { Task, TaskId, TaskTitle, View, ViewId, ViewTitle } from "./types";
import { ViewChange, ViewManager } from "./view";
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  first,
  forkJoin,
} from "rxjs";

export const INIT_OPERATION_ID = generateOperationId();

export enum WipmanStatus {
  InitStarted = "InitStarted",
  InitCompleted = "InitCompleted",
  BrowserLoadStarted = "BrowserLoadStarted",
  BrowserLoadCompleted = "BrowserLoadCompleted",
  BackendLoadStarted = "BackendLoadStarted",
  BackendLoadCompleted = "BackendLoadCompleted",
  AddTaskInApiStarted = "AddTaskInApiStarted",
  AddTaskInApiCompleted = "AddTaskInApiCompleted",
  UpdateTaskInApiStarted = "UpdateTaskInApiStarted",
  UpdateTaskInApiCompleted = "UpdateTaskInApiCompleted",
  DeleteTaskInApiStarted = "DeleteTaskInApiStarted",
  DeleteTaskInApiCompleted = "DeleteTaskInApiCompleted",
  AddViewInStoreStarted = "AddViewInStoreStarted",
  AddViewInStoreCompleted = "AddViewInStoreCompleted",
  UpdateViewInApiStarted = "UpdateViewInApiStarted",
  UpdateViewInApiCompleted = "UpdateViewInApiCompleted",
  RemoveViewFromStoreStarted = "RemoveViewFromStoreStarted",
  RemoveViewFromStoreCompleted = "RemoveViewFromStoreCompleted",
}

interface ConstructorArgs {
  settingsManager: SettingsManager;
  admin: Admin;
  storage: Storage;
  taskManager: TaskManager;
  viewManager: ViewManager;
  operationsManager: OperationsManager;
  errors: ErrorsService;
}

/**
 * `Wipman` represents any non-visual aspect of the webapp.
 *
 * Purpose: decouple logic from view layer for easier development,
 * maintenance and testing.
 */
export class Wipman {
  public lastStatus: WipmanStatus | undefined;
  public status$: Observable<WipmanStatus>;
  public settingsManager: SettingsManager;
  public admin: Admin;
  public storage: Storage; // TODO: instead of exposing everything here... perhaps make it private and provide a narrower API?
  public tasks$: Observable<Map<TaskId, Task>>;
  public views$: Observable<Map<ViewId, View>>;
  public operationChange$: Observable<OperationStatusChange>;
  public errors: ErrorsService;

  private statusSubject: Subject<WipmanStatus>;
  private tasksSubject: BehaviorSubject<Map<TaskId, Task>>;
  private viewsSubject: BehaviorSubject<Map<ViewId, View>>;
  private taskManager: TaskManager;
  private viewManager: ViewManager;
  private operationsManager: OperationsManager;

  constructor({
    settingsManager,
    admin,
    storage,
    taskManager,
    viewManager,
    operationsManager,
    errors,
  }: ConstructorArgs) {
    this.statusSubject = new Subject<WipmanStatus>();
    this.status$ = this.statusSubject.asObservable();

    this.settingsManager = settingsManager;
    this.admin = admin;
    this.storage = storage;
    this.taskManager = taskManager;
    this.viewManager = viewManager;
    this.operationsManager = operationsManager;
    this.errors = errors;

    this.operationChange$ = this.operationsManager.change$;

    this.settingsManager.change$.subscribe((change) => {
      console.debug(`Wipman.settingsManager.change$::`, change);
    });
    // # re-expose settings events to UI via Wipman
    // settings_manager.changes$.subscribe(change => {
    //   match change:
    //     case: status$.next(`Settings::${change}`)
    // })

    this.status$.subscribe((status) => {
      console.debug(`Wipman.status$::${status}`);
      this.lastStatus = status;
    });

    // Tasks
    this.tasksSubject = new BehaviorSubject<Map<TaskId, Task>>(new Map());
    this.tasks$ = this.tasksSubject.asObservable();

    this.taskManager.change$.subscribe((change) => {
      console.log(`Wipman.taskManager.changes$:`, change);
      this.tasksSubject.next(this.taskManager.tasks);
    });

    this.tasks$.subscribe((tasks) => {
      console.debug(`Wipman::tasks$:`, tasks);
    });

    // Views
    this.viewsSubject = new BehaviorSubject<Map<ViewId, View>>(new Map());
    this.views$ = this.viewsSubject.asObservable();

    this.viewManager.change$.subscribe((change) => {
      console.log(`wipman.viewManager.change$:`, change);
      this.viewsSubject.next(this.viewManager.views);
    });

    // re-expose task events to UI via Wipman
    // taskManager.changes$.subscribe(change => {
    //   if self.wipmanInitialized is False:
    //     return  # don't emit yet
    //   match change:
    //     case: status.next(`TaskManager::${change}`)
    // })

    // # re-expose view events to UI via Wipman
    // view_manager.changes$.subscribe(change => {
    //   if self.wipmanInitialized is False:
    //     return  # don't emit yet
    //   match change:
    //     case: status.next(`ViewManager::${change}`)
    // })

    //
    //   Hook-up persistence layer to react to domain changes
    //
    this.taskManager.change$.subscribe((change) =>
      this.handleTaskChanges(change)
    );
    this.viewManager.change$.subscribe((change) => {
      this.handleViewChanges(change);
    });
  }

  public async initialize(): Promise<void> {
    this.statusSubject.next(WipmanStatus.InitStarted);
    const initOp = this.operationsManager.start(INIT_OPERATION_ID);

    //
    //   Load settings from browser
    //
    const settings = this.storage.readSettings();
    this.settingsManager.init(settings);

    //
    //   Load stored data
    //
    this.storage.readAll().subscribe(({ tasks, views }) => {
      console.log(`Wipman.initialize::data retrieved from browser and API`);

      const tasksInitialized$ = this.taskManager.change$.pipe(
        filter((change) => change.kind === "TasksInitialized"),
        first()
      );
      const viewsInitialized$ = this.viewManager.change$.pipe(
        filter((change) => change.kind === "ViewsInitialized"),
        first()
      );
      const initCompleted$ = forkJoin([tasksInitialized$, viewsInitialized$]);
      initCompleted$.subscribe((_) => {
        console.log(`Wipman.initialize:: initialization completed`);
        this.operationsManager.end({ operationId: initOp });
        this.statusSubject.next(WipmanStatus.InitCompleted);
      });

      this.taskManager.initialize({ tasks });
      this.viewManager.initialize({ views });
    });
  }

  public addTask({ title }: { title: TaskTitle }): void {
    this.taskManager.addTask({ title });
  }

  public updateTask({ task }: { task: Task }): void {
    this.taskManager.updateTask(task);
  }

  public getTask({ id }: { id: TaskTitle }): Task | undefined {
    return this.taskManager.getTask(id);
  }

  public removeTask(taskId: TaskId): void {
    this.taskManager.removeTask(taskId);
  }

  public addView({ title }: { title: ViewTitle }): void {
    this.viewManager.addView({ title });
  }

  public updateView({ view }: { view: View }): void {
    this.viewManager.updateView(view);
  }

  public removeView({ id }: { id: ViewId }): void {
    this.viewManager.removeView(id);
  }

  public getView({ id }: { id: ViewId }): View | undefined {
    return this.viewManager.getView(id);
  }

  public isOperationCompleted({ id }: { id: OperationId }): boolean {
    const completed = this.operationsManager.operations.get(id);
    if (completed === undefined) {
      throw new Error(
        `BUG: tried to retrieve an operation that does not exist`
      );
    }

    return completed === "ended";
  }

  public pushAllToRemote(): void {
    console.warn(`Wipman.pushAllToRemote::pushing tasks to server`);
    this.taskManager.tasks.forEach((task) => this.updateTaskInStore(task.id));
    console.warn(`Wipman.pushAllToRemote::tasks pushed to server`);

    console.warn(`Wipman.pushAllToRemote::pushing views to server`);
    this.viewManager.views.forEach((view) => this.updateViewInStore(view.id));
    console.warn(`Wipman.pushAllToRemote::views pushed to server`);
  }

  // public readSettings(): Settings {}

  // public updateSettings({ settings }: { settings: Settings }): void {}

  private handleTaskChanges(change: TaskChanges): void {
    switch (change.kind) {
      case "TasksInitialized":
        break;
      case "TaskAdded":
        this.addTaskToStore(change.id);
        break;
      case "TaskUpdated":
        this.updateTaskInStore(change.id);
        break;
      case "TaskDeleted":
        this.deleteTaskFromStore(change.id);
        break;

      default:
        assertNever(change, `Unsupported TaskChange variant: ${change}`);
    }
  }

  private handleViewChanges(change: ViewChange): void {
    switch (change.kind) {
      case "ViewsInitialized":
        return;
      case "ViewAdded":
        return this.addViewToStore(change.id);
      case "ViewUpdated":
        return this.updateViewInStore(change.id);
      case "ViewDeleted":
        return this.deleteViewFromStore(change.id);
      case "TaskAddedToView":
        return this.updateViewInStore(change.id);
      case "TaskRemovedFromView":
        return this.updateViewInStore(change.id);

      default:
        assertNever(change, `Unsupported ViewChange variant: ${change}`);
    }
  }

  private addTaskToStore(taskId: TaskId): void {
    /**
     * Design note: this method should only be used once initialization is complete.
     * This means that, after initialization, the Managers are the source of truth, and
     * the Storage is only persisting the changes emited by the Managers. There is no
     * need for the Storage to emit the new state to the Managers. Hence it's more
     * convenient that the store returns an observable that represents the progress of
     * the 'add task' transaction, instead of broadcasting changes to a wider audience
     * (like Managers do).
     */

    this.statusSubject.next(WipmanStatus.AddTaskInApiStarted);

    this.storage.addTask({ taskId }).subscribe({
      next: (event) => {
        if (event.kind.startsWith("FailedTo")) {
          this.errors.add({
            header: event.kind,
            description: JSON.stringify(event),
          });
        }
      },
      error: (error) => {
        this.errors.add({
          header: `Unknown error`,
          description: JSON.stringify(error),
        });
        this.statusSubject.next(WipmanStatus.AddTaskInApiCompleted);
      },
      complete: () => {
        this.statusSubject.next(WipmanStatus.AddTaskInApiCompleted);
      },
    });
  }

  private updateTaskInStore(taskId: TaskId): void {
    this.statusSubject.next(WipmanStatus.UpdateTaskInApiStarted);

    this.storage.updateTask({ taskId }).subscribe({
      next: (event) => {
        if (event.kind.startsWith("FailedTo")) {
          this.errors.add({
            header: event.kind,
            description: JSON.stringify(event),
          });
        }
      },
      error: (error) => {
        this.errors.add({
          header: `Unknown error`,
          description: JSON.stringify(error),
        });
        this.statusSubject.next(WipmanStatus.UpdateTaskInApiCompleted);
      },
      complete: () => {
        this.statusSubject.next(WipmanStatus.UpdateTaskInApiCompleted);
      },
    });
  }

  private deleteTaskFromStore(taskId: TaskId): void {
    const progress$ = this.storage.deleteTask({ taskId });
    this.statusSubject.next(WipmanStatus.DeleteTaskInApiStarted);

    progress$.subscribe({
      next: (event) => {
        if (event.kind.startsWith("FailedTo")) {
          this.errors.add({
            header: event.kind,
            description: JSON.stringify(event),
          });
        }
      },
      error: (error) =>
        this.errors.add({
          header: `Unknown error`,
          description: JSON.stringify(error),
        }),
      complete: () => {
        this.statusSubject.next(WipmanStatus.DeleteTaskInApiCompleted);
      },
    });
    this.statusSubject.next(WipmanStatus.DeleteTaskInApiCompleted);
  }

  private addViewToStore(viewId: ViewId): void {
    this.statusSubject.next(WipmanStatus.AddViewInStoreStarted);

    this.storage.addView({ viewId }).subscribe({
      next: (event) => {
        if (event.kind.startsWith("FailedTo")) {
          this.errors.add({
            header: event.kind,
            description: JSON.stringify(event),
          });
        }
      },
      error: (error) => {
        this.errors.add({
          header: `Unknown error`,
          description: JSON.stringify(error),
        });
        this.statusSubject.next(WipmanStatus.AddViewInStoreCompleted);
      },
      complete: () => {
        this.statusSubject.next(WipmanStatus.AddViewInStoreCompleted);
      },
    });
  }

  private updateViewInStore(viewId: ViewId): void {
    this.statusSubject.next(WipmanStatus.UpdateViewInApiStarted);
    this.storage.updateView({ viewId }).subscribe({
      next: (event) => {
        if (event.kind.startsWith("FailedTo")) {
          this.errors.add({
            header: event.kind,
            description: JSON.stringify(event),
          });
        }
      },
      error: (error) => {
        this.errors.add({
          header: `Unknown error`,
          description: JSON.stringify(error),
        });
        this.statusSubject.next(WipmanStatus.UpdateViewInApiCompleted);
      },
      complete: () => {
        this.statusSubject.next(WipmanStatus.UpdateViewInApiCompleted);
      },
    });
  }

  private deleteViewFromStore(viewId: ViewId): void {
    this.statusSubject.next(WipmanStatus.RemoveViewFromStoreStarted);

    this.storage.deleteView({ viewId }).subscribe({
      next: (event) => {
        if (event.kind.startsWith("FailedTo")) {
          this.errors.add({
            header: event.kind,
            description: JSON.stringify(event),
          });
        }
      },
      error: (error) => {
        this.errors.add({
          header: `Unknown error`,
          description: JSON.stringify(error),
        });
        this.statusSubject.next(WipmanStatus.RemoveViewFromStoreCompleted);
      },
      complete: () => {
        this.statusSubject.next(WipmanStatus.RemoveViewFromStoreCompleted);
      },
    });
  }
}

// type ViewChanges = ViewAdded | ViewUpdated | ViewDeleted;
