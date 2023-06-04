import { TaskManager } from "./task";
import { Tag } from "./types";
import { ViewManager } from "./view";

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
});
