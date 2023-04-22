import { generateHash } from "./domain/hash";
import { ISODatetimeString, Task } from "./domain/types";

interface CreateTaskProps {
  id?: string;
  updated?: ISODatetimeString;
}
export function createTask({ id, updated }: CreateTaskProps): Task {
  const task: Task = {
    id: id ? id : generateHash(),
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
