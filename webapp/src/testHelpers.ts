import { generateHash } from "./domain/hash";
import { ISODatetimeString, Task, TaskId } from "./domain/types";

interface CreateTaskProps {
  id?: TaskId;
  title?: string;
  updated?: ISODatetimeString;
}
export function createTask({ id, title, updated }: CreateTaskProps): Task {
  const task: Task = {
    id: id ? id : generateHash(),
    title: title ? title : "task title",
    content: "task content!",
    tags: new Set(["tag1"]),
    blocks: new Set(["taskId1"]),
    blockedBy: new Set(["taskId2"]),
    created: "2022-09-18T01:00:02+01:00",
    updated: updated ? updated : "2022-09-18T07:09:18+01:00",
    completed: false,
  };
  return task;
}
