import { todo } from "../devex";
import { assertNever } from "../exhaustive-match";
import { WipmanApi } from "../services/api";
import { ErrorsService } from "../services/errors";
import { Storage } from "../services/persistence/persist";
import { SettingsManager } from "./settings";
import { TaskChanges, TaskManager } from "./task";
import { Task, TaskId } from "./types";
import { BehaviorSubject, Observable, Subject } from "rxjs";

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
}

interface ConstructorArgs {
  settingsManager: SettingsManager;
  storage: Storage;
  api: WipmanApi;
  taskManager: TaskManager;
  // viewManager: ViewManager;
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
  public storage: Storage; // TODO: instead of exposing everything here... perhaps make it private and provide a narrower API?
  public tasks$: Observable<Map<TaskId, Task>>;
  // public viewChanges$: Observable<ViewChanges>;
  public errors: ErrorsService;

  private statusSubject: Subject<WipmanStatus>;
  private tasksSubject: BehaviorSubject<Map<TaskId, Task>>;
  private api: WipmanApi;
  private taskManager: TaskManager;
  // private viewManager: ViewManager;

  constructor({
    settingsManager,
    storage,
    api,
    taskManager,
    errors,
  }: ConstructorArgs) {
    this.statusSubject = new Subject<WipmanStatus>();
    this.status$ = this.statusSubject.asObservable();

    this.settingsManager = settingsManager;
    this.storage = storage;
    this.taskManager = taskManager;
    this.api = api;
    this.errors = errors;

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

    this.tasksSubject = new BehaviorSubject<Map<TaskId, Task>>(new Map());
    this.tasks$ = this.tasksSubject.asObservable();

    this.taskManager.change$.subscribe((change) => {
      console.log(`Wipman.taskManager.changes$:`, change);
      this.tasksSubject.next(this.taskManager.tasks);
    });

    this.tasks$.subscribe((tasks) => {
      console.debug(`Wipman::tasks$:`, tasks);
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
    // this.viewManager.change$.subscribe(change => {
    //   this.browserStorage.store(change.view)
    //   this.api.push(change.view)
    // })
  }

  public async initialize(): Promise<void> {
    this.statusSubject.next(WipmanStatus.InitStarted);

    //
    //   Load settings from browser
    //
    const settings = this.storage.readSettings();
    this.settingsManager.init(settings);

    //
    //   Load stored data
    //
    this.storage.readAll().subscribe(({ tasks /*, views */ }) => {
      console.log(`Wipman.init::data retrieved from browser and API`);
      this.taskManager.initialize({ tasks });
      // this.viewManager.initialize({views});

      this.statusSubject.next(WipmanStatus.InitCompleted);
    });
  }

  public addTask({ title }: { title: string }): void {
    this.taskManager.addTask({ title });
  }

  public updateTask({ task }: { task: Task }): void {
    this.taskManager.updateTask(task);
  }

  public getTask({ id }: { id: string }): Task | undefined {
    return this.taskManager.getTask(id);
  }

  // public async updateTask(): Promise {}

  public removeTask(taskId: TaskId): void {
    this.taskManager.removeTask(taskId);
  }

  // public async addView(): Promise {}

  // public async removeView(): Promise {}

  // public async updateView(): Promise {}

  // public readSettings(): Settings {}

  // public updateSettings({ settings }: { settings: Settings }): void {}

  private handleTaskChanges(change: TaskChanges): void {
    switch (change.kind) {
      case "TasksInitialized":
        break;
      case "TaskAdded":
        this.addTaskInApi(change.id);
        break;
      case "TaskUpdated":
        this.updateTaskInApi(change.id);
        break;
      case "TaskDeleted":
        todo({ message: "TODO: add support for TaskDeleted" });
        break;

      default:
        assertNever(change, `Unsupported TaskChange variant: ${change}`);
    }
  }

  private addTaskInApi(taskId: TaskId): void {
    this.statusSubject.next(WipmanStatus.AddTaskInApiStarted);

    const task = this.taskManager.getTask(taskId);
    if (task === undefined) {
      throw new Error(`Expected a Task with ID ${taskId} in TaskManager`);
    }

    this.api.createTask({ task }).then((_) => {
      this.statusSubject.next(WipmanStatus.AddTaskInApiEnd);
    });
  }

  private updateTaskInApi(taskId: TaskId): void {
    this.statusSubject.next(WipmanStatus.UpdateTaskInApiStarted);

    const task = this.taskManager.getTask(taskId);
    if (task === undefined) {
      throw new Error(`Expected a Task with ID ${taskId} in TaskManager`);
    }

    this.api.updateTask({ task }).then((_) => {
      this.statusSubject.next(WipmanStatus.UpdateTaskInApiEnd);
    });
  }
}

// type ViewChanges = ViewAdded | ViewUpdated | ViewDeleted;
