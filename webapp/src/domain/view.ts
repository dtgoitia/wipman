import { todo } from "../devex";
import { nowIsoString } from "./dates";
import { generateHash } from "./hash";
import { Hash, Tag, View, ViewId, ViewTitle } from "./types";
import { Observable, Subject } from "rxjs";

interface NewView {
  title: ViewTitle;
}

interface ViewManagerProps {
  views?: Map<ViewId, View>;
}
export class ViewManager {
  public views: Map<ViewId, View>;
  public change$: Observable<ViewChange>;

  private changeSubject: Subject<ViewChange>;

  constructor({ views }: ViewManagerProps) {
    this.views = views || new Map<ViewId, View>();
    this.changeSubject = new Subject<ViewChange>();
    this.change$ = this.changeSubject.asObservable();
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

    // TODO: create view in file system - maybe this needs to subscribe to the stream of tasks, that would make the domain independent of the persistence layer, and it probably would be more testable

    this.changeSubject.next({ kind: "ViewAdded", id });
    return view;
  }

  public updateView(view: View): void {
    // find task by `view.id`, and replace with `view`
    // TODO: if a Task is missing from view.tasks, it means the user removed it --> this.taskManager.removeTask(taskId);
    todo();
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
  | { readonly kind: "ViewsInitialized" }
  | { readonly kind: "ViewAdded"; readonly id: ViewId }
  | { readonly kind: "ViewUpdated"; readonly id: ViewId }
  | { readonly kind: "ViewDeleted"; readonly id: ViewId };
