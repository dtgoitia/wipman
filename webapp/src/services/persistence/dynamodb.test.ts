import { createTask } from "../../testHelpers";
import { DynamoDbClient } from "./dynamodb";

describe("DynamoDB", () => {
  let db: DynamoDbClient;

  beforeAll(async () => {
    db = new DynamoDbClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
    const result = await db.createTables();
    expect(result.$metadata.httpStatusCode).toEqual(200);
  });

  afterAll(async () => {
    const result = await db.deleteTables();
    expect(result.$metadata.httpStatusCode).toEqual(200);
  });

  it("create, retrieve and delete a single task", async () => {
    const task = createTask({});
    const result = await db.addTask(task);
    expect(result.$metadata.httpStatusCode).toEqual(200);

    const retrieved = await db.getTaskById(task.id);
    expect(retrieved).toEqual(task);

    await db.deleteTasks(task);

    const deleted = await db.getTaskById(task.id);
    expect(deleted).toEqual(undefined);
  });

  it("create multiple tasks, and retrieve them by updated date", async () => {
    const a = createTask({ id: "a", updated: "2022-09-18 10:00Z" });
    const b = createTask({ id: "b", updated: "2022-09-18 11:00Z" });
    const c = createTask({ id: "c", updated: "2022-09-18 12:00Z" });
    const tasks = [a, b, c];

    await Promise.all(
      tasks.map(async (task) => {
        await db.addTask(task);
        const retrieved = await db.getTaskById(task.id);
        console.log(retrieved);
      })
    );

    const after = new Date("2022-09-18 10:30Z");

    const tasksAfter = await db.getTasksUpdatedAfter(after);
    expect(tasksAfter).toEqual([b, c]);
  });
});
