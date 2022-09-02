import { TaskManager } from "../domain/task";
import { Tag, Task, TaskId } from "../domain/types";

/**
 * TODO
 * on start up:
 *  1. load tasks from browser
 *  2. load tasks from remote DB
 *
 * task manager: persistence agnostic - data in memory
 * storage:
 *  - it's just an adaptor for parallel storages
 *  - listen to task manager (in-memory) data changes and persist in the background
 *  - collect data and hand it over to task manager on start
 *
 * on start:
 *   - UI subscribes to TaskManager
 *   - TaskManager requests data to Storage <--- NO, see (1)
 *   - Storage reads from browser
 *   - Storage returns to TaskManager
 *   - TaskManager emits new state
 *   - UI receives new state and rerenders
 *
 * 1: this means that TaskManager knows about Storage, but you want to keep TaskManger
 *    decoupled from Storage to improve make it more testable.
 *
 * on start:
 *   - UI subscribes to TaskManager
 *   - some initialization logic requests data to Storage
 *   - Storage reads from browser
 *   - Storage returns to some initialization logic
 *   - some initialization logic does a bulk data load in TaskManager
 *   - TaskManager emits new state
 *   - UI receives new state and rerenders
 *
 * "some initialization logic" could be a function in the Domain - separate from the
 * TaskManager and ViewManager - that could be called by the UI when the UI decides to
 * do so. This way, the UI can show spinners, while loading data async in the background
 */

// TODO: read this from storage
const SAMPLE_TASKS: Task[] = [
  {
    id: "aaaaaaa",
    title: "task 1 title",
    content: "# Task 1 header\nThis is the best **markdown** content",
    created: "2022-09-05T10:21:45+01:00",
    updated: "2022-09-05T10:21:45+01:00",
    tags: new Set<Tag>(["hiru", "foo"]),
    blockedBy: new Set<TaskId>(),
    blocks: new Set<TaskId>(),
  },
  {
    id: "bbbbbbb",
    title: "task 2 title",
    content: "# Task 2 header\nThis is the best **markdown** content",
    created: "2022-09-05T10:23:12+01:00",
    updated: "2022-09-05T10:23:12+01:00",
    tags: new Set<Tag>(),
    blockedBy: new Set<TaskId>(),
    blocks: new Set<TaskId>(),
  },
];

const taskMap = new Map<TaskId, Task>();
SAMPLE_TASKS.forEach((task) => {
  taskMap.set(task.id, task);
});

const taskManager = new TaskManager({ tasks: taskMap });
export default taskManager;
