import { todo } from "../devex";
import { assertNever } from "../exhaustive-match";
import { WipmanApi } from "../services/api";
import { TaskChanges, TaskManager, mergeTasks } from "./task";
import { Task, TaskId } from "./types";
import { Observable, Subject } from "rxjs";

export enum WipmanStatus {
  InitStarted = "InitStarted",
  InitCompleted = "InitCompleted",
  BrowserLoadStarted = "BrowserLoadStarted",
  BrowserLoadCompleted = "BrowserLoadCompleted",
  BackendLoadStarted = "BackendLoadStarted",
  BackendLoadCompleted = "BackendLoadCompleted",
  AddTaskInApiStarted = "AddTaskInApiStarted",
  AddTaskInApiEnd = "AddTaskInApiEnd",
  UpdateTaskInApiStarted = "UpdateTaskInApiStarted",
  UpdateTaskInApiEnd = "UpdateTaskInApiEnd",
}

interface ConstructorArgs {
  // settingsManager: SettingsManager;
  // browserStorage: BrowserStorage;
  api: WipmanApi;
  taskManager: TaskManager;
  // viewManager: ViewManager;
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
  // public settingsChanges$: Observable<SettingsEvents>;
  public tasks$: Observable<Map<TaskId, Task>>;
  // public viewChanges$: Observable<ViewChanges>;

  private statusSubject: Subject<WipmanStatus>;
  // private settingsManager: SettingsManager;
  // private browserStorage: BrowserStorage;
  private api: WipmanApi;
  private taskManager: TaskManager;
  // private viewManager: ViewManager;

  constructor({ taskManager, api }: ConstructorArgs) {
    this.statusSubject = new Subject<WipmanStatus>();
    this.status$ = this.statusSubject.asObservable();

    this.taskManager = taskManager;
    this.api = api;

    this.status$.subscribe((status) => {
      console.debug(`Wipman.status$::${status}`);
      this.lastStatus = status;
    });

    this.tasks$ = this.taskManager.tasks$;
    this.tasks$.subscribe((tasks) => {
      console.debug(`Wipman::tasks$:`, tasks);
    });

    // # re-expose settings events to UI via Wipman
    // settings_manager.changes$.subscribe(change => {
    //   match change:
    //     case: status$.next(`Settings::${change}`)
    // })

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
  }

  public async initialize(): Promise<void> {
    this.statusSubject.next(WipmanStatus.InitStarted);

    this.tasks$ = this.taskManager.tasks$;
    // this.views$ = this.viewManager.views$;

    //
    //   Load data
    //

    let tasks: Task[] = [];
    // let views: View[] = [];
    // tasks = this.browserStorage.readTasks();
    // views = this.browserStorage.readViews();
    if (this.api.isOnline()) {
      console.debug(`Wipman.initialize::fetching tasks from API`);
      try {
        const { tasks: apiTasks, views: apiViews } =
          await this.api.getLastChanges();
        console.log(apiViews); // TODO: added to quiet linters :P
        tasks = mergeTasks({ a: tasks, b: apiTasks });
      } catch (error) {
        console.debug(`Wipman.initialize::failed to fetch tasks from API`);
        console.warn(error);
      }
      // views = mergeViews({a: views, b: apiViews});
    }

    console.debug(`Wipman.initialize::tasks loaded`);
    console.debug(tasks);

    this.taskManager.bulkLoadTasks({ tasks, publish: true });
    // this.viewManager.init(views);

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

    this.statusSubject.next(WipmanStatus.InitCompleted);
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

// type SettingsEvents = SettingsUpdated;
// type ViewChanges = ViewAdded | ViewUpdated | ViewDeleted;
