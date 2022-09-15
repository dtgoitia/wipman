import { nowIsoString } from "./dates";
import { generateHash } from "./hash";
import { Hash, TaskId, Task, Tag } from "./types";
import { BehaviorSubject, Observable } from "rxjs";

interface NewTask {
  title: string;
}

interface TaskManagerProps {
  tasks?: Map<TaskId, Task>;
}
export class TaskManager {
  public tasks$: Observable<Map<TaskId, Task>>; // all tasks
  private tasksSubject: BehaviorSubject<Map<TaskId, Task>>;

  // latest state of tasks - it could be stored in a BehaviourSubject really... think about it
  public tasks: Map<TaskId, Task>;

  constructor({ tasks }: TaskManagerProps) {
    this.tasks = tasks || new Map<TaskId, Task>();
    //   TODO this.tasks might not be necessary, maybe you can store it inside the
    //   BehaviourSubject and if you need to retrieve it in a sync mannet, just use
    //   `this.tasksSubject.getValue()`. Although it seems more convenient in this case
    //   the current design: having a state separate from the BehaviourSubject makes the
    //   code more readable, and then the BehaviourSubject is used to publish downstream
    this.tasksSubject = new BehaviorSubject<Map<TaskId, Task>>(this.tasks);
    this.tasks$ = this.tasksSubject.asObservable();
  }

  public addTask({ title }: NewTask): Task {
    const id: Hash = generateHash();
    const task: Task = {
      id,
      title,
      content: "",
      created: nowIsoString(),
      updated: nowIsoString(),
      tags: new Set<Tag>(),
      blockedBy: new Set<TaskId>(),
      blocks: new Set<TaskId>(),
    };
    this.tasks.set(id, task);

    // TODO: create task in file system - maybe this needs to subscribe to the stream of tasks, that would make the domain independent of the persistence layer, and it probably would be more testable

    // publish all task - if any View is listening, it can rerender them and there, else you save that computation
    this.publishTasks(); // TODO: needs testing
    return task;
  }

  public updateTask(task: Task): Task {
    if (this.taskChanged(task) === false) return task;

    this.tasks.set(task.id, task);

    // publish all task - if any View is listening, it can rerender them and there, else you save that computation
    this.publishTasks(); // TODO: needs testing
    return task;
  }

  public removeTask(id: TaskId): void {
    // TODO: you probably want to use Result --> https://github.com/badrap/result
    this.tasks.delete(id);

    // publish all task - if any View is listening, it can rerender them and there, else you save that computation
    this.publishTasks(); // TODO: needs testing
  }

  public getTask(id: TaskId): Task | undefined {
    // TODO: you probably want to use Result --> https://github.com/badrap/result
    if (this.tasks.has(id) === false) return undefined;

    return this.tasks.get(id);
  }

  /**
   * Load multiple existing tasks that already contain a task ID. This method overwrites
   * any existing tasks if the task ID matches.
   */
  public bulkLoadTasks(tasks: Task[], publish: boolean = false): void {
    tasks.forEach((task) => {
      this.tasks.set(task.id, task);
    });

    if (publish) {
      this.publishTasks();
    }
  }

  public publishTasks(): void {
    console.debug("TaskManager.publishTasks()");
    this.tasksSubject.next(this.tasks);
  }

  private taskChanged(updated: Task): boolean {
    const existing = this.getTask(updated.id);

    if (existing === undefined) return false;

    const changed =
      existing.title !== updated.title ||
      existing.content !== updated.content ||
      existing.created !== updated.created ||
      existing.updated !== updated.updated ||
      existing.blockedBy !== updated.blockedBy ||
      existing.blocks !== updated.blocks;

    console.debug(`TaskManager.taskChanged: ${changed}`);
    return changed;
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
