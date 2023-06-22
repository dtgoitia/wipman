import { generateHash } from "../../domain/hash";
import { Task } from "../../domain/types";

type buildTaskArgs = Partial<Task>;

export function buildTask({
  id,
  title,
  content,
  created,
  updated,
  tags,
  blockedBy,
  blocks,
  completed,
}: buildTaskArgs): Task {
  const task: Task = {
    id: id || generateHash(),
    title: title || "task title",
    content: content || "task content!",
    tags: tags || new Set(["tag1"]),
    blocks: blocks || new Set(["taskId1"]),
    blockedBy: blockedBy || new Set(["taskId2"]),
    created: created || "2022-09-18T01:00:02+01:00",
    updated: updated || "2022-09-18T07:09:18+01:00",
    completed: completed || false,
  };
  return task;
}
