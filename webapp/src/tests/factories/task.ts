import { generateHash } from "../../domain/hash";
import {
  ISODatetimeString,
  MarkdownString,
  Tag,
  Task,
  TaskId,
  TaskTitle,
} from "../../domain/types";

interface buildTaskArgs {
  id?: TaskId;
  title?: TaskTitle;
  content?: MarkdownString;
  created?: ISODatetimeString;
  updated?: ISODatetimeString;
  tags?: Set<Tag>;
  blockedBy?: Set<TaskId>;
  blocks?: Set<TaskId>;
  completed?: boolean;
}
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
