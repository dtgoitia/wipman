export type ISODatetimeString = string; // "2022-07-19T07:11:00+01:00"
export type Hash = string;
export type TaskId = Hash;
export type TaskTitle = string;
export type ViewTitle = string;
export type FilterQuery = string;
export type MarkdownString = string;

export interface Task {
  readonly id: TaskId;
  readonly title: TaskTitle;
  readonly content: MarkdownString;
  readonly created: ISODatetimeString;
  readonly updated: ISODatetimeString;
  readonly tags: Set<Tag>;
  readonly blockedBy: Set<TaskId>; // tasks must be done before the current task
  readonly blocks: Set<TaskId>; // tasks that are blocked until the current task is done
  readonly completed: boolean;
}

// this is not called Group because in this new design, you don't need to have different types of tags to specify "tags", "precedent task", "next task", etc. All the task dependencies are now specified in the task content as metadata
export type Tag = string;

export type ViewId = Hash;
export interface View {
  readonly id: ViewId;
  readonly title: ViewTitle;
  readonly created: ISODatetimeString;
  readonly updated: ISODatetimeString;
  readonly tags: Set<Tag>; // contains all tags in set, later you can add the possibility of more complex queries but don't prematurely optimize
  readonly tasks: TaskId[]; // use a list to preserve order
}

export interface Settings {
  readonly apiUrl?: string;
  readonly apiToken?: string;
}

export interface FilterSpec {
  readonly query: FilterQuery;
  readonly showCompleted: boolean;
}
