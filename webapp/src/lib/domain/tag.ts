import { Tag, Task, View } from "./types";
import { Observable, Subject } from "rxjs";

export class TagManager {
  public change$: Observable<TagChange>;

  private tags: Set<Tag>;
  private changeSubject: Subject<TagChange>;
  private initialized: boolean;

  constructor() {
    this.tags = new Set<Tag>();
    this.changeSubject = new Subject<TagChange>();
    this.change$ = this.changeSubject.asObservable();
    this.initialized = false;
  }

  public initialize({ tasks, views }: { tasks: Task[]; views: View[] }): void {
    if (this.initialized) throw new Error("Cannot initialize twice");

    const tags = new Set<Tag>();
    for (const task of tasks) {
      for (const tag of task.tags) {
        tags.add(tag);
      }
    }

    for (const view of views) {
      for (const tag of view.tags) {
        tags.add(tag);
      }
    }

    this.tags = tags;
    this.initialized = true;
    this.changeSubject.next({ kind: "InitializationCompleted" });
  }

  public add({ tag }: { tag: Tag }): void {
    this.tags.add(tag);
    this.changeSubject.next({ kind: "TagAdded", tag });
  }

  public deleted({ tag }: { tag: Tag }): void {
    this.tags.delete(tag);
    this.changeSubject.next({ kind: "TagDeleted", tag });
  }

  public getAll(): Set<Tag> {
    return new Set(this.tags.values());
  }
}

type TagChange =
  | { kind: "InitializationCompleted" }
  | { kind: "TagAdded"; tag: Tag }
  | { kind: "TagDeleted"; tag: Tag };

export function sortTags(tags: Tag[] | Set<Tag>): Tag[] {
  if (tags instanceof Set) {
    return [...tags.values()].sort();
  }

  return [...tags].sort();
}
