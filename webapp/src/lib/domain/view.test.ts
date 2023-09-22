import { TaskManager } from "./task";
import { Tag, View } from "./types";
import { ViewManager } from "./view";
import { first } from "rxjs";
import { describe, expect, it } from "vitest";

describe("ViewManager", () => {
  const taskManager = new TaskManager();

  it("can be initialized empty", () => {
    const man = new ViewManager({ taskManager });
    expect(man.views.size).toEqual(0);
  });

  it("adds a new view", () => {
    const taskManager = new TaskManager();
    const man = new ViewManager({ taskManager });
    const returned = man.addView({ title: "new view title" });

    // Returned view has expected shape and data
    expect(returned.title).toEqual("new view title");
    expect(returned.tags).toEqual(new Set<Tag>());

    // Only one view is stored
    const views = [...man.views.values()];
    expect(views.length).toEqual(1);

    // Returned view is the stored view
    const retrieved = views[0];
    expect(returned).toEqual(retrieved);
  });

  // TODO: more tests are needed

  describe(`when a Task is added`, () => {
    const viewATags = new Set<Tag>(["tag1", "tag2"]);
    const viewBTags = new Set<Tag>(["tag3"]);

    const taskManager = new TaskManager();
    const viewManager = new ViewManager({ taskManager });

    const viewA = viewManager.addView({ title: "A" });
    viewManager.updateView({ ...viewA, tags: viewATags });

    const viewB = viewManager.addView({ title: "B" });
    viewManager.updateView({ ...viewB, tags: viewBTags });

    it(`only adds a Task to the Views whose tags match`, () => {
      expect(viewA.tasks.length).toBe(0);
      expect(viewB.tasks.length).toBe(0);

      viewManager.change$.pipe(first()).subscribe((change) => {
        if (change.kind !== "TaskAddedToView") {
          throw new Error();
        }

        const updatedA = viewManager.getView(viewA.id) as View;
        expect(updatedA.tasks).toStrictEqual([change.taskId]);

        const updatedB = viewManager.getView(viewB.id) as View;
        expect(updatedB.tasks).toStrictEqual([]);
      });

      taskManager.addTask({
        title: "test task",
        tags: viewATags,
      });
    });
  });

  describe.skip(`when a Task is updated`, () => {
    const viewATags = new Set<Tag>(["tag1", "tag2"]);
    const viewBTags = new Set<Tag>(["tag3"]);

    const taskManager = new TaskManager();
    const viewManager = new ViewManager({ taskManager });

    const viewA = viewManager.addView({ title: "A" });
    viewManager.updateView({ ...viewA, tags: viewATags });

    const viewB = viewManager.addView({ title: "B" });
    viewManager.updateView({ ...viewB, tags: viewBTags });

    it.skip(`it remains in Views whose tags match`, () => {
      // TODO
    });

    it.skip(`it is removed from Views whose tags don't match`, () => {
      // TODO
    });
  });
});
