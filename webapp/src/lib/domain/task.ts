import { unreachable } from "../devex";
import { setsAreEqual } from "../set";
import { nowIsoString } from "./dates";
import { generateHash } from "./hash";
import { Hash, MarkdownString, Tag, Task, TaskId, TaskTitle } from "./types";
import { BehaviorSubject, Observable, Subject } from "rxjs";

type TasksIndexedByTag = Map<Tag, Set<TaskId>>;

interface NewTask {
  title: TaskTitle;
  tags?: Set<Tag>;
}

export class TaskManager {
  public tasks$: Observable<Map<TaskId, Task>>; // all tasks
  public change$: Observable<TaskChanges>;

  private tasksPerTag: TasksIndexedByTag;
  private tasksSubject: BehaviorSubject<Map<TaskId, Task>>;
  public changeSubject: Subject<TaskChanges>;

  // latest state of tasks - it could be stored in a BehaviourSubject really... think about it
  public tasks: Map<TaskId, Task>;

  constructor() {
    this.tasks = new Map<TaskId, Task>();
    //   TODO this.tasks might not be necessary, maybe you can store it inside the
    //   BehaviourSubject and if you need to retrieve it in a sync mannet, just use
    //   `this.tasksSubject.getValue()`. Although it seems more convenient in this case
    //   the current design: having a state separate from the BehaviourSubject makes the
    //   code more readable, and then the BehaviourSubject is used to publish downstream

    this.tasksPerTag = new Map<Tag, Set<TaskId>>();
    this.tasksSubject = new BehaviorSubject<Map<TaskId, Task>>(this.tasks);
    this.tasks$ = this.tasksSubject.asObservable();

    this.changeSubject = new Subject<TaskChanges>();
    this.change$ = this.changeSubject.asObservable();
    this.change$.subscribe((change) =>
      console.debug(`${TaskManager.name}.changes$:`, change)
    );
  }

  /**
   * Load multiple existing tasks that already contain a task ID. This method overwrites
   * any existing tasks if the task ID matches.
   */
  public initialize({ tasks }: { tasks: Task[] }): void {
    tasks.forEach((task) => {
      this.tasks.set(task.id, task);
      this.addTaskToTagIndexes(task.id, task.tags);
    });

    this.changeSubject.next({ kind: "TasksInitialized" });
  }

  public addTask({ title, tags }: NewTask): Task {
    console.debug(`${TaskManager.name}.${this.addTask.name}::started`);
    const id: Hash = generateHash();
    const task: Task = {
      id,
      title,
      content: "",
      created: nowIsoString(),
      updated: nowIsoString(),
      tags: tags === undefined ? new Set<Tag>() : tags,
      blockedBy: new Set<TaskId>(),
      blocks: new Set<TaskId>(),
      completed: false,
    };
    this.tasks.set(id, task);

    this.addTaskToTagIndexes(task.id, task.tags);

    this.changeSubject.next({ kind: "TaskAdded", id });
    console.debug(`${TaskManager.name}.${this.addTask.name}::ended`);
    return task;
  }

  public updateTask(task: Task): Task {
    console.debug(`TaskManager.updateTask::task:`, task);

    const oldTask = this.getTask(task.id);
    if (oldTask === undefined) {
      throw unreachable({
        message: `BUG - attempted to update a Task ${task.id} that is not in TaskManager`,
      });
    }

    const diff = diffTasks({ before: oldTask, after: task });
    console.debug(`TaskManager.updateTask::diff:`, diff);
    if (diff.hasChanges === false) {
      console.info(
        `TaskManager.updateTask: nothing has changed, no changes will be emitted`
      );
      return task;
    }

    const tagsChanged = diff.updatedTags !== undefined;
    if (tagsChanged) {
      const newTags = diff.updatedTags;
      console.debug(
        `TaskManager.updateTask: tags changed from `,
        oldTask.tags,
        ` to `,
        newTags
      );

      this.removeTaskFromTagIndex(oldTask.id, oldTask.tags);
      this.addTaskToTagIndexes(task.id, newTags);
    }

    this.tasks.set(task.id, task);

    this.changeSubject.next({ kind: "TaskUpdated", id: task.id });
    return task;
  }

  public removeTask(id: TaskId): void {
    // TODO: you probably want to use Result --> https://github.com/badrap/result
    const task = this.tasks.get(id);
    if (task === undefined) return;

    this.removeTaskFromTagIndex(task.id, task.tags);
    this.tasks.delete(id);

    this.changeSubject.next({ kind: "TaskDeleted", id });
  }

  public getTask(id: TaskId): Task | undefined {
    // TODO: you probably want to use Result --> https://github.com/badrap/result
    if (this.tasks.has(id) === false) return undefined;

    return this.tasks.get(id);
  }

  public getTasksByTag(tag: Tag): Set<Task> {
    const taskIds = this.tasksPerTag.get(tag) || new Set<TaskId>();

    const tasks = new Set<Task>();

    for (const taskId of taskIds) {
      const task = this.getTask(taskId);
      if (task) {
        tasks.add(task);
      }
    }

    return tasks;
  }

  private addTaskToTagIndexes(id: TaskId, tags: Set<Tag>): void {
    for (const tag of tags) {
      const tasks = this.tasksPerTag.get(tag) || new Set();
      tasks.add(id);
      this.tasksPerTag.set(tag, tasks);
    }
  }

  private removeTaskFromTagIndex(id: TaskId, tags: Set<Tag>): void {
    for (const tag of tags) {
      const tasks = this.tasksPerTag.get(tag);
      if (tasks === undefined) return;

      tasks.delete(id);

      if (tasks.size === 0) {
        // Clean up empty set
        this.tasksPerTag.delete(tag);
      } else {
        // TODO: is this needed? or is the reference maintained?
        this.tasksPerTag.set(tag, tasks);
      }
    }
  }
}

/* decision: you don't add/remove tasks to views, instead views are computed on the fly using filters
  pro: single source of truth, no need to update views when a task changes. Just keep the view data in a stream, and emit on task change
  Hold on, maybe you need to store some state to keep tasks in a given order within a view, perhaps just build a linked list to avoid editing a large amount of records when you move one item to another position in the queue?

As a planner, I sort tasks manually to express priority between unrelated tasks.
As a planner, interdependent tasks are display in a graph and then I can manually sort them, because trying to achieve this automatically is not trivial and probably a premature optimization.

Is there (A) a global order to tasks and a view is a subset of that ordered list? or (B) are there local per-view orders that can conflict between them at global level?
A seems wrong, problematic example: filtering by tags you might get an intermittent view of a sequence of dependant tasks, if if you reorder a task in that trimmed view, you might not have data enough to determine the global order again.
Go with b:
  - per-view local ordered tasks.
  - each view points to tasks
  - tasks are indexed by ID, but unsorted
  - tasks only have order within a View
Implementation:
  - map of TaskId : Task
  - view: spec of filters
  - rendered view?:
    - collection of TaskIds built by applying a View (filter) to all existing tasks
    - remembers last order specified by the user
    - new Tasks go at the end of the list: necessary to know if a TaskId already exists in RenderedView
    - most common interaction: read
      - access pattern: traverse list of TaskIds, no access by index
      - frequency: very often
    - other interactions: add
      - access pattern: find last and append
      - frequency: sometimes
    - other interactions: remove
      - access pattern: find item by ID, remove it, amend related links
      - frequency: rarely

RenderedView: linked list, no indexing needed
  - use a map: each task points to the next task; last task points to null/undefined
  - to quickly add new items to the end of the linked list, store last item in a separate variable, to avoid traversing the whole graph to find the end of the linked list
  - to quickly find start of linked list, store first item in a separate variable, to avoid traversing the whole graph to find the start to find the linked list
  - potential optimization (leave it for later, only if needed): use a double linked list so that when you delete an item, you can find previous item in O(1) and update the related links
*/

// class RenderedView {
//   private first: TaskId;
//   private last: TaskId;
//   private map: Map<TaskId, TaskId | null>
//   constructor(
//     readonly view: View,
//     readonly tasks: Task[],
//     previous: RenderedViewAsJson,
//   ) {
//     // first get subset of tasks that comply with view filter
//     // then build map: traverse `previous` and add item to the map if exists in `tasks`
//     // this first time build should only happen once on start, then use methods underneath to efficiently update the refer
//   }

//   public add(id: TaskId, publish: boolean): void {
//     if (this.contains(id)) return;

//     this.map[this.last] = id;
//     this.map[id] = null;
//     this.last = id;

//     if (publish === false) return;

//     this.publishTasks();
//   }

//   public remove(id: TaskId, publish: boolean): void {
//     if (this.contains(id) === false) return;

//     const [previous, next] = this.findLinks(id);
//     // only remove previous if it's not the first item
//     if (previous !== null) {
//       this.map[this.previous] = next;
//     }
//     delete this.map[id];

//     if (publish === false) return;

//     this.publishTasks();
//   }

//   public removeMany(ids: TaskId [], publish: boolean): void {
//     const [...allButLast, last] = ids;
//     allButLast.forEach(id => this.remove(id, false))
//     this.remove(id, publish);
//   }

//   private contains(id: TaskId): boolean {
//     return this.map.has(id);
//   }

//   private findLinks(id: TaskId): [TaskId, TaskId] {
//     // edge case: id is the first item in the list
//     if (id === this.start) {
//       const second = this.map[id];
//       return [null, second];
//     }

//     let previous: TaskId = this.start;

//     let current = this.map[previous];
//     let next = this.map[current];

//     while (current !== id) {
//       previous = current;
//       current = next;
//       next = this.map[next];
//     }

//     return [previous, next];
//   }

//   private publishTasks(): void {
//     // todo: duplicate map and freeze it before emitting
//     this.tasks$.next(this.map)
//   }
// }

// potential optimization: when you need to render them tasks, instead of converting the linked list (graph) to a list, use a generator to only render what you need

// // question: when using CRUD methods, should I use the Result pattern instead of returning `void`?
// if ok, Result.status: SUCCESS
// else, Result.status: ERROR, Result.reason: "blah blah"

interface MergeTaskArgs {
  a: Task[];
  b: Task[];
}

export function mergeTasks({ a, b }: MergeTaskArgs): Task[] {
  // Index tasks in B by ID
  const bIndex = new Map<TaskId, Task>();
  for (const task of b) {
    bIndex.set(task.id, task);
  }

  const result: Task[] = [];

  // traverse A, comparing each task with its counterpart in B
  for (const aTask of a) {
    const id = aTask.id;
    const bCounterpart = bIndex.get(id);
    if (bCounterpart === undefined) {
      result.push(aTask);
      continue;
    }

    const ta = new Date(aTask.updated).getTime();
    const tb = new Date(bCounterpart.updated).getTime();
    const mostRecent = ta < tb ? bCounterpart : aTask;
    result.push(mostRecent);

    // by removing B items already checks, at the end of the loop the map will only
    // contain those items in B that were not in A and still need to be included in
    // the result
    bIndex.delete(id);
  }

  // append remaining items B that were not present in A
  for (const bTask of bIndex.values()) {
    result.push(bTask);
  }

  return result;
}

export type TaskChanges =
  | { readonly kind: "TasksInitialized" }
  | { readonly kind: "TaskAdded"; readonly id: TaskId }
  | { readonly kind: "TaskUpdated"; readonly id: TaskId }
  | { readonly kind: "TaskDeleted"; readonly id: TaskId };

interface TaskDiffArgs {
  updatedTitle?: TaskTitle;
  updatedTags?: Set<Tag>;
  updatedBlockedBy?: Set<TaskId>;
  updatedBlocks?: Set<TaskId>;
  updatedCompleted?: boolean;
  updatedContent?: MarkdownString;
}
class TaskDiff {
  public readonly updatedTitle?: TaskTitle;
  public readonly updatedTags?: Set<Tag>;
  public readonly updatedBlockedBy?: Set<TaskId>;
  public readonly updatedBlocks?: Set<TaskId>;
  public readonly updatedCompleted?: boolean;
  public readonly updatedContent?: MarkdownString;
  public readonly hasChanges: boolean;

  constructor({
    updatedTitle,
    updatedTags,
    updatedBlockedBy,
    updatedBlocks,
    updatedCompleted,
    updatedContent,
  }: TaskDiffArgs) {
    this.updatedTitle = updatedTitle;
    this.updatedTags = updatedTags;
    this.updatedBlockedBy = updatedBlockedBy;
    this.updatedBlocks = updatedBlocks;
    this.updatedCompleted = updatedCompleted;
    this.updatedContent = updatedContent;

    this.hasChanges =
      this.updatedTitle !== undefined ||
      this.updatedTags !== undefined ||
      this.updatedBlockedBy !== undefined ||
      this.updatedBlocks !== undefined ||
      this.updatedCompleted !== undefined ||
      this.updatedContent !== undefined;
  }
}

/**
 * Returns the Task properties that got updated
 */
export function diffTasks({
  before,
  after,
}: {
  before: Task;
  after: Task;
}): TaskDiff {
  console.debug(`before:`, before);
  console.debug(`after:`, after);

  if (before.id !== after.id) {
    throw unreachable({
      message: `tasks with different IDs cannot be compared: ${before.id} & ${after.id}`,
    });
  }

  if (
    new Date(before.created).getTime() !== new Date(after.created).getTime()
  ) {
    throw unreachable({
      message:
        `Task ${before.id} creation must never change, but` +
        ` changed from ${before.created} to ${after.created}`,
    });
  }

  let updatedTitle: TaskTitle | undefined = undefined;
  let updatedTags: Set<Tag> | undefined = undefined;
  let updatedBlockedBy: Set<TaskId> | undefined = undefined;
  let updatedBlocks: Set<TaskId> | undefined = undefined;
  let updatedCompleted: boolean | undefined = undefined;
  let updatedContent: MarkdownString | undefined = undefined;

  if (before.title !== after.title) {
    updatedTitle = after.title;
  }

  if (setsAreEqual(before.tags, after.tags) === false) {
    updatedTags = after.tags;
  }

  if (setsAreEqual(before.blockedBy, after.blockedBy) === false) {
    updatedBlockedBy = after.blockedBy;
  }

  if (setsAreEqual(before.blocks, after.blocks) === false) {
    updatedBlocks = after.blocks;
  }

  if (before.completed !== after.completed) {
    updatedCompleted = after.completed;
  }

  if (before.content !== after.content) {
    updatedContent = after.content;
  }

  return new TaskDiff({
    updatedTitle,
    updatedTags,
    updatedBlockedBy,
    updatedBlocks,
    updatedCompleted,
    updatedContent,
  });
}

export function addBlockedTask({
  task,
  blocked,
}: {
  task: Task;
  blocked: TaskId;
}): Task {
  const updated: Task = {
    ...task,
    blocks: new Set<TaskId>([...task.blocks.values(), blocked]),
  };

  return updated;
}

export function addBlockingTask({
  task,
  blocking,
}: {
  task: Task;
  blocking: TaskId;
}): Task {
  const updated: Task = {
    ...task,
    blockedBy: new Set<TaskId>([...task.blockedBy.values(), blocking]),
  };

  return updated;
}

export function removeBlockedTask({
  task,
  blocked,
}: {
  task: Task;
  blocked: TaskId;
}): Task {
  const blockedTasks = new Set<TaskId>([...task.blocks.values()]);
  blockedTasks.delete(blocked);

  const updated: Task = { ...task, blocks: blockedTasks };
  return updated;
}

export function removeBlockingTask({
  task,
  blocking,
}: {
  task: Task;
  blocking: TaskId;
}): Task {
  const blockedByTasks = new Set<TaskId>([...task.blockedBy.values()]);
  blockedByTasks.delete(blocking);

  const updated: Task = { ...task, blockedBy: blockedByTasks };
  return updated;
}
