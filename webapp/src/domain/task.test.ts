import { TaskManager } from "./task";
import { Tag, Task } from "./types";

describe("TaskManager", () => {
  it("can be initialized empty", () => {
    const man = new TaskManager({});
    expect(man.tasks.size).toEqual(0);
  });

  it("adds a new task", () => {
    const man = new TaskManager({});
    const returned = man.addTask({ title: "new task title" });

    // Returned task has expected shape and data
    expect(returned.title).toEqual("new task title");
    expect(returned.content).toEqual("");

    // Only one task is stored
    const tasks = [...man.tasks.values()];
    expect(tasks.length).toEqual(1);

    // Returned task is the stored task
    const retrieved = tasks[0];
    expect(returned).toEqual(retrieved);
  });

  it("updates an existing task", () => {
    const man = new TaskManager({});
    const existing = man.addTask({ title: "existing" });

    const updated: Task = { ...existing, content: "some new content" };

    const returned = man.updateTask(updated);

    // Returned task is the updated task
    expect(returned).toEqual(updated);

    // Only one task is stored
    const tasks = [...man.tasks.values()];
    expect(tasks.length).toEqual(1);

    // Returned task is the stored task
    const retrievedTask = tasks[0];
    expect(returned).toEqual(retrievedTask);
  });

  it.skip("updates a task that does not exist", () => {
    // TODO: you probably want to use Result --> https://github.com/badrap/result
  });

  it("removes a task", () => {
    const man = new TaskManager({});
    const existing = man.addTask({ title: "existing" });

    expect(man.tasks.size).toEqual(1);

    man.removeTask(existing.id);

    expect(man.tasks.size).toEqual(0);
  });

  it("retrieves a task by ID", () => {
    const man = new TaskManager({});
    const existing = man.addTask({ title: "existing" });

    const retrieved = man.getTask(existing.id);
    expect(retrieved).toEqual(existing);
  });
});
