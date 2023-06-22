import { todo } from "../devex";
import { buildTask } from "../tests/factories/task";
import { TaskManager, mergeTasks } from "./task";
import { Task } from "./types";
import { describe, expect, it } from "vitest";

describe("TaskManager", () => {
  it("can be initialized empty", () => {
    const man = new TaskManager();
    expect(man.tasks.size).toEqual(0);
  });

  it("adds a new task", () => {
    const man = new TaskManager();
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
    const man = new TaskManager();
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
    const man = new TaskManager();
    const existing = man.addTask({ title: "existing" });

    expect(man.tasks.size).toEqual(1);

    man.removeTask(existing.id);

    expect(man.tasks.size).toEqual(0);
  });

  it("retrieves a task by ID", () => {
    const man = new TaskManager();
    const existing = man.addTask({ title: "existing" });

    const retrieved = man.getTask(existing.id);
    expect(retrieved).toEqual(existing);
  });
});

describe("mergeTasks", () => {
  it(`preserves most up to date entries when present in both groups`, () => {
    const yesterday = "2023-04-19T00:00:00+00:00";
    const today = "2023-04-20T00:00:00+00:00";

    const task_a1 = buildTask({ title: "task a", updated: today });
    const task_b1 = buildTask({ title: "task b", updated: yesterday });
    const task_c = buildTask({ title: "task c", updated: today });

    const task_a2: Task = { ...task_a1, updated: yesterday };
    const task_b2: Task = { ...task_b1, updated: today };

    const a: Task[] = [task_a1, task_b1];
    const b: Task[] = [task_a2, task_b2, task_c];

    expect(mergeTasks({ a, b })).toEqual([task_a1, task_b2, task_c]);
  });

  it(`handles first being empty`, () => {
    const task = buildTask({});
    const b: Task[] = [task];
    expect(mergeTasks({ a: [], b })).toEqual([task]);
  });
  it(`handles second being empty`, () => {
    const task = buildTask({});
    const a: Task[] = [task];
    expect(mergeTasks({ a, b: [] })).toEqual([task]);
  });
  it(`handles both being empty`, () => {
    expect(mergeTasks({ a: [], b: [] })).toEqual([]);
  });
  it.skip(`handles entries with different timezones`, () => {
    todo();
  });
});
