import { generateHash } from "./hash";
import { Hash, Tag, View, ViewId, ViewTitle } from "./types";
import { BehaviorSubject, Observable } from "rxjs";

interface NewView {
  title: ViewTitle;
}

interface ViewManagerProps {
  views?: View[];
}
export class ViewManager {
  public views$: Observable<View[]>; // all views - to update the ViewExplorer page
  private viewsSubject: BehaviorSubject<View[]>;

  // latest state of views - it could be stored in a BehaviourSubject really... think about it
  public views: View[];

  constructor({ views }: ViewManagerProps) {
    this.views = views || [];
    this.viewsSubject = new BehaviorSubject<View[]>(this.views);
    this.views$ = this.viewsSubject.asObservable();
  }

  public addView({ title }: NewView): View {
    const id: Hash = generateHash();
    const view: View = { id, title, tags: new Set<Tag>() };
    this.views.push(view);

    // TODO: create view in file system - maybe this needs to subscribe to the stream of tasks, that would make the domain independent of the persistence layer, and it probably would be more testable

    // publish all task - if any RenderedView is listening, it can rerender them and there, else you save that computation
    this.publishViews(); // TODO: needs testing
    return view;
  }

  public updateView(view: View) {
    // find task by `view.id`, and replace with `view`
  }

  public removeView(id: ViewId) {}

  public getView(id: ViewId): View | undefined {
    // TODO: you probably want to use Result --> https://github.com/badrap/result
    const matches = this.views.filter((view) => view.id === id);
    if (matches.length === 0) return undefined;

    const view = matches[0];
    return view;
  }

  public publishViews(): void {
    this.viewsSubject.next(this.views);
  }
}
