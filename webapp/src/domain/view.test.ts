import { Tag } from "./types";
import { ViewManager } from "./view";

describe("ViewManager", () => {
  it("can be initialized empty", () => {
    const man = new ViewManager({});
    expect(man.views.length).toEqual(0);
  });

  it("adds a new view", () => {
    const man = new ViewManager({});
    const returned = man.addView({ title: "new view title" });

    // Returned view has expected shape and data
    expect(returned.title).toEqual("new view title");
    expect(returned.tags).toEqual(new Set<Tag>());

    // Only one task is stored
    const views = [...man.views.values()];
    expect(views.length).toEqual(1);

    // Returned task is the stored task
    const retrieved = views[0];
    expect(returned).toEqual(retrieved);
  });

  // TODO: more tests are needed
});
