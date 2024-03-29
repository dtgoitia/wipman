import { assertNever } from "../../exhaustive-match";
import { unreachable } from "../devex";
import { is_intersection, setsAreEqual } from "../set";
import { nowIsoString } from "./dates";
import { generateHash } from "./hash";
import { TaskChanges, TaskManager } from "./task";
import { Hash, Tag, TaskId, View, ViewId, ViewTitle } from "./types";
import { Observable, Subject } from "rxjs";

interface NewView {
  title: ViewTitle;
}

interface ViewManagerProps {
  taskManager: TaskManager;
}
export class ViewManager {
  public views: Map<ViewId, View>;
  public change$: Observable<ViewChange>;

  private taskManager: TaskManager;
  private changeSubject: Subject<ViewChange>;
  private viewsByTask: Map<TaskId, Set<ViewId>>;

  constructor({ taskManager }: ViewManagerProps) {
    this.views = new Map<ViewId, View>();
    this.taskManager = taskManager;
    this.changeSubject = new Subject<ViewChange>();
    this.change$ = this.changeSubject.asObservable();

    this.viewsByTask = new Map<TaskId, Set<ViewId>>();

    this.taskManager.change$.subscribe((change) =>
      this.handleTaskChange(change)
    );

    this.change$.subscribe((change) =>
      console.debug(`${ViewManager.name}.change$:`, change)
    );
  }

  public addView({ title }: NewView): View {
    const id: Hash = generateHash();
    const view: View = {
      id,
      title,
      created: nowIsoString(),
      updated: nowIsoString(),
      tags: new Set<Tag>(),
      tasks: [],
    };
    this.views.set(view.id, view);

    this.addViewToIndex({ view });

    this.changeSubject.next({ kind: "ViewAdded", id });
    return view;
  }

  public updateView(view: View): void {
    console.debug(`ViewManager.updateView::view:`, view);

    const oldView = this.getView(view.id);
    if (oldView === undefined) {
      throw unreachable({
        message: `BUG - attempted to update a View ${view.id} that is not in ViewManager`,
      });
    }

    const diff = diffViews({ before: oldView, after: view });
    console.debug(`ViewManager.updateView::diff:`, diff);
    if (diff.hasChanges === false) {
      console.info(
        `ViewManager.updateView: nothing has changed, no changes will be emitted`
      );
      return;
    }

    this.views.set(view.id, view);

    if (diff.updatedTags !== undefined) {
      this.removeViewFromIndex({ id: view.id });
      this.addViewToIndex({ view });
    }

    if (diff.updatedTaskIds !== undefined) {
      // Potential optimization: this could be optimized by updating the diff to
      //   specify which specific Task IDs have been add/removed. Bear in mind,
      //   no that Task IDs might have changed because their order has changed,
      //   but no Task ID has been added or removed
      this.removeViewFromIndex({ id: view.id });
      this.addViewToIndex({ view });
    }

    this.changeSubject.next({ kind: "ViewUpdated", id: view.id });
  }

  public removeView(id: ViewId): void {
    const deleted = this.views.delete(id);
    if (deleted === false) return;

    this.changeSubject.next({ kind: "ViewDeleted", id });
  }

  public getView(id: ViewId): View | undefined {
    // TODO: you probably want to use Result --> https://github.com/badrap/result
    if (this.views.has(id) === false) return undefined;

    return this.views.get(id);
  }

  public initialize({ views }: { views: View[] }): void {
    views.forEach((view) => {
      this.views.set(view.id, view);
    });

    this.changeSubject.next({ kind: "ViewsInitialized" });
  }

  public recompute(): void {
    const recomputed = new Map<ViewId, View>();

    for (const oldView of this.views.values()) {
      const tasks = new Set<TaskId>();

      for (const task of this.taskManager.tasks.values()) {
        if (shouldViewIncludeTask({ view: oldView, taskTags: task.tags })) {
          tasks.add(task.id);
        }
      }

      // In order to preserve the order of the tasks that correctly exist in the old View tasks, compare with the new recomputed and append

      const recomputedTasks: TaskId[] = [];
      for (const task of oldView.tasks) {
        const mustRemain = tasks.has(task);
        if (mustRemain) {
          recomputedTasks.push(task);
          tasks.delete(task);
        } else {
          // Was in (old) View, but must not be there
        }
      }

      // Append remaining tags that are still not in View
      for (const task of tasks.values()) {
        recomputedTasks.push(task);
      }

      const view: View = { ...oldView, tasks: recomputedTasks };
      recomputed.set(view.id, view);
    }

    this.views = recomputed;

    this.changeSubject.next({ kind: "ViewsRecomputedFromTasks" });
  }

  private addViewToIndex({ view }: { view: View }): void {
    for (const tag of view.tags) {
      const tasks = this.taskManager.getTasksByTag(tag);
      for (const task of tasks) {
        this.updateIndexToAddTaskToView({ viewId: view.id, taskId: task.id });
      }
    }
  }

  private removeViewFromIndex({ id }: { id: ViewId }): void {
    for (const [taskId, viewIds] of this.viewsByTask.entries()) {
      if (viewIds.has(id) === false) continue;
      this.updateIndexToRemoveTaskFromView({ viewId: id, taskId });
    }
  }

  private updateIndexToAddTaskToView({
    viewId,
    taskId,
  }: {
    viewId: ViewId;
    taskId: TaskId;
  }): void {
    const currentViews = this.viewsByTask.get(taskId) || new Set<ViewId>();
    this.viewsByTask.set(taskId, new Set<ViewId>([...currentViews, viewId]));
  }

  private handleTaskChange(change: TaskChanges): void {
    console.debug(
      `${ViewManager.name}.${this.handleTaskAdded.name}::change:`,
      change
    );
    switch (change.kind) {
      case "TasksInitialized":
        return;
      case "TaskAdded":
        return this.handleTaskAdded({ id: change.id });
      case "TaskUpdated":
        return this.handleTaskUpdated({ id: change.id });
        // I think is safe to ignore this event because Views only know the Task ID
        return;
      case "TaskDeleted":
        return this.handleTaskDeleted({ id: change.id });
      default:
        assertNever(change, `Unsupported TaskChange type: ${change}`);
    }
  }

  private handleTaskAdded({ id: taskId }: { id: TaskId }): void {
    console.debug(
      `${ViewManager.name}.${this.handleTaskAdded.name}::taskId`,
      taskId
    );

    const task = this.taskManager.getTask(taskId);
    if (task === undefined) {
      throw unreachable({
        message: `expected to find Task ${taskId} in TaskManager but didn't`,
      });
    }

    for (const [viewId, view] of this.views) {
      const viewShouldIncludeTask = shouldViewIncludeTask({
        view,
        taskTags: task.tags,
      });

      if (viewShouldIncludeTask) {
        console.debug(
          `${ViewManager.name}.${this.handleTaskAdded.name}: Task` +
            ` '${taskId}' must appear in '${viewId}' View and it` +
            ` doesn't. Adding it now...`
        );

        this.addTaskToView({ view, taskId });
      } else {
        console.debug(
          `${ViewManager.name}.${this.handleTaskAdded.name}: Task` +
            ` '${taskId}' must not appear in '${viewId}' View and it` +
            ` doesn't. Nothing to do`
        );
      }
    }
  }

  private handleTaskUpdated({ id: taskId }: { id: TaskId }): void {
    console.debug(
      `${ViewManager.name}.${this.handleTaskUpdated.name}::taskId`,
      taskId
    );

    const task = this.taskManager.getTask(taskId);
    if (task === undefined) {
      throw unreachable({
        message: `expected to find Task ${taskId} in TaskManager but didn't`,
      });
    }

    for (const [viewId, view] of this.views) {
      const viewShouldIncludeTask = shouldViewIncludeTask({
        view,
        taskTags: task.tags,
      });

      const viewIncludesTask = view.tasks.includes(taskId);

      switch (true) {
        case viewShouldIncludeTask && viewIncludesTask: {
          console.debug(
            `${ViewManager.name}.${this.handleTaskUpdated.name}: Task` +
              ` '${taskId}' must appear in '${viewId}' View and it` +
              ` does. Nothing to do`
          );
          break;
        }

        case viewShouldIncludeTask && viewIncludesTask === false: {
          // add task to indexes and emit
          console.debug(
            `${ViewManager.name}.${this.handleTaskUpdated.name}: Task` +
              ` '${taskId}' must appear in '${viewId}' View and it` +
              ` doesn't. Adding it now...`
          );

          this.addTaskToView({ view, taskId });
          break;
        }

        case viewShouldIncludeTask === false && viewIncludesTask: {
          console.debug(
            `${ViewManager.name}.${this.handleTaskUpdated.name}: Task` +
              ` '${taskId}' must not appear in '${viewId}' View and it` +
              ` does. Removing it now...`
          );
          this.deleteTaskFromView({ view, taskId });
          break;
        }

        case viewShouldIncludeTask === false && viewIncludesTask == false: {
          console.debug(
            `${ViewManager.name}.${this.handleTaskUpdated.name}: Task` +
              ` '${taskId}' must not appear in '${viewId}' View and it` +
              ` doesn't. Nothing to do`
          );
          break;
        }

        default:
          throw unreachable({
            message: "BUG: you shouldn't reached here",
          });
      }
    }
  }

  private handleTaskDeleted({ id: taskId }: { id: TaskId }): void {
    console.info(`ViewManager.handleTaskDeleted::taskId:`, taskId);

    this.getViewsByTask(taskId) // views that had the task before the deletion
      .forEach((view: View) => {
        this.deleteTaskFromView({ view, taskId });
      });
  }

  private addTaskToView({
    view,
    taskId,
  }: {
    view: View;
    taskId: TaskId;
  }): void {
    this.updateIndexToAddTaskToView({ viewId: view.id, taskId });

    const updated: View = {
      ...view,
      updated: nowIsoString(),
      tasks: [...view.tasks, taskId],
    };
    this.views.set(view.id, updated);

    this.changeSubject.next({
      kind: "TaskAddedToView",
      id: view.id,
      taskId,
    });

    console.debug(
      `${ViewManager.name}.${this.addTaskToView.name}: Task` +
        ` '${taskId}' appended to View '${view.id}'`
    );
  }

  private deleteTaskFromView({
    view,
    taskId,
  }: {
    view: View;
    taskId: TaskId;
  }): void {
    this.updateIndexToRemoveTaskFromView({ viewId: view.id, taskId });

    const updated: View = {
      ...view,
      updated: nowIsoString(),
      tasks: view.tasks.filter((existingTaskId) => existingTaskId !== taskId),
    };
    this.views.set(view.id, updated);

    this.changeSubject.next({
      kind: "TaskRemovedFromView",
      id: view.id,
      taskId,
    });

    console.debug(
      `${ViewManager.name}.${this.deleteTaskFromView.name}: Task` +
        ` '${taskId}' removed from View '${view.id}'`
    );
  }

  private getViewsByTask(id: TaskId): View[] {
    const viewIds: ViewId[] = [...(this.viewsByTask.get(id) || [])];
    return viewIds
      .map((viewId) => this.views.get(viewId))
      .filter((viewId) => viewId !== undefined) as View[];
  }

  private updateIndexToRemoveTaskFromView({
    viewId,
    taskId,
  }: {
    viewId: ViewId;
    taskId: TaskId;
  }): void {
    const currentViews = this.viewsByTask.get(taskId);
    if (currentViews === undefined) {
      // There are no views that show this task.
      return;
    }

    currentViews.delete(viewId);

    this.viewsByTask.set(taskId, currentViews);
  }
}

interface MergeViewsArgs {
  a: View[];
  b: View[];
}

export function mergeViews({ a, b }: MergeViewsArgs): View[] {
  // Index views in B by ID
  const bIndex = new Map<ViewId, View>();
  for (const view of b) {
    bIndex.set(view.id, view);
  }

  const result: View[] = [];

  // traverse A, comparing each view with its counterpart in B
  for (const aView of a) {
    const id = aView.id;
    const bCounterpart = bIndex.get(id);
    if (bCounterpart === undefined) {
      result.push(aView);
      continue;
    }

    const ta = new Date(aView.updated).getTime();
    const tb = new Date(bCounterpart.updated).getTime();
    const mostRecent = ta < tb ? bCounterpart : aView;
    result.push(mostRecent);

    // by removing B items already checks, at the end of the loop the map will only
    // contain those items in B that were not in A and still need to be included in
    // the result
    bIndex.delete(id);
  }

  // append remaining items B that were not present in A
  for (const bView of bIndex.values()) {
    result.push(bView);
  }

  return result;
}

export type ViewChange =
  | { kind: "ViewsInitialized" }
  | { kind: "ViewsRecomputedFromTasks" }
  | { kind: "ViewAdded"; id: ViewId }
  | { kind: "ViewUpdated"; id: ViewId }
  | { kind: "ViewDeleted"; id: ViewId }
  | { kind: "TaskAddedToView"; id: ViewId; taskId: TaskId }
  | { kind: "TaskRemovedFromView"; id: ViewId; taskId: TaskId };

function shouldViewIncludeTask({
  view,
  taskTags,
}: {
  view: View;
  taskTags: Set<Tag>;
}): boolean {
  // TODO: this is a first naive approach to filter tasks and create views. It needs
  // to be extended. It's a separate function to make it very testable in anticipation
  // to the fact that this function will probably grow and support abundant use cases.

  if (view.tags.size === 0) {
    // If the view has no tags, then all tasks should appear in it.
    return true;
  }

  const at_least_one_tag_in_common = is_intersection(view.tags, taskTags);
  return at_least_one_tag_in_common;
}

interface ViewDiffArgs {
  updatedTitle: ViewTitle | undefined;
  updatedTags: Set<Tag> | undefined;
  updatedTaskIds: TaskId[] | undefined;
}
class ViewDiff {
  public readonly updatedTitle: ViewTitle | undefined;
  public readonly updatedTags: Set<Tag> | undefined;
  public readonly updatedTaskIds: TaskId[] | undefined;

  public readonly hasChanges: boolean;
  constructor({ updatedTitle, updatedTags, updatedTaskIds }: ViewDiffArgs) {
    this.updatedTitle = updatedTitle;
    this.updatedTags = updatedTags;
    this.updatedTaskIds = updatedTaskIds;

    this.hasChanges =
      this.updatedTitle !== undefined ||
      this.updatedTags !== undefined ||
      this.updatedTaskIds !== undefined;
  }
}

function diffViews({ before, after }: { before: View; after: View }): ViewDiff {
  // To create/update/delete in `after` View

  // Find if title changed
  const titleChanged = before.title !== after.title;
  const updatedTitle = titleChanged ? after.title : undefined;

  // Find if tags have changed
  const didTagsChange = setsAreEqual(before.tags, after.tags) === false;
  const updatedTags = didTagsChange ? after.tags : undefined;

  // Find if task IDs
  let didTaskIdsChange = false;

  if (before.tasks.length !== after.tasks.length) {
    didTaskIdsChange = true;
  } else {
    if (isOrderEqual(before.tasks, after.tasks) === false) {
      didTaskIdsChange = true;
    }
  }

  const updatedTaskIds = didTaskIdsChange ? after.tasks : undefined;

  return new ViewDiff({ updatedTitle, updatedTags, updatedTaskIds });
}

function isOrderEqual(a: TaskId[], b: TaskId[]): boolean {
  const longest = Math.max(a.length, b.length);

  for (let i = 0; i < longest; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
