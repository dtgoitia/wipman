import { Task } from "./domain/types";

export function createTask(): Task {
  const task: Task = {
    id: "1nadlksjn1",
    title: "task title",
    content: "task content!",
    tags: new Set(["tag1"]),
    blocks: new Set(["taskId1"]),
    blockedBy: new Set(["taskId2"]),
    created: "2022-09-18T01:00:02+01:00",
    updated: "2022-09-18T07:09:18+01:00",
  };
  return task;
}
