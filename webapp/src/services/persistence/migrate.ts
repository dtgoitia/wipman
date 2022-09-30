import { Task } from "../../domain/types";
import { DynamoDbClient } from "./dynamodb";

const db = new DynamoDbClient({
  region: "localhost",
  endpoint: "http://localhost:8000",
});

function createTask({ id, updated }: { id: string; updated: string }): Task {
  const task: Task = {
    id,
    title: "task title",
    content: "task content!",
    tags: new Set(["tag1"]),
    blocks: new Set(["taskId1"]),
    blockedBy: new Set(["taskId2"]),
    created: "2022-09-18T01:00:02+01:00",
    updated: updated ? updated : "2022-09-18T07:09:18+01:00",
  };
  return task;
}

async function main() {
  console.log("Creating tables...");
  await db.createTables();

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
}

main().then((_) => console.log("finished"));
