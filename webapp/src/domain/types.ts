export type ISODatetimeString = string; // "2022-07-19T07:11:00+01:00"
export type Hash = string;
export type TaskId = Hash;
type MarkdownString = string;

export interface Task {
  id: TaskId;
  title: string;
  content: MarkdownString;
  created: ISODatetimeString;
  updated: ISODatetimeString;
  tags: Set<Tag>;
  blockedBy: Set<TaskId>; // tasks must be done before the current task
  blocks: Set<TaskId>; // tasks that are blocked until the current task is done
}

// this is not called Group because in this new design, you don't need to have different types of tags to specify "tags", "precedent task", "next task", etc. All the task dependencies are now specified in the task content as metadata
export type Tag = string;

export type ViewId = Hash;
export interface View {
  id: ViewId;
  title: string;
  tags: Set<Tag>; // contains all tags in set, later you can add the possibility of more complex queries but don't prematurely optimize
}
