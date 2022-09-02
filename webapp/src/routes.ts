import { TaskId, ViewId } from "./domain/types";

enum Paths {
  root = "/",
  tasks = "/tasks",
  task = "/tasks/:taskId",
  views = "/views",
  view = "/views/:viewId",
  settings = "/settings",
  notFound = "/*",
}

export function getTaskPath(id: TaskId) {
  return `${Paths.tasks}/${id}`;
}

export function getViewPath(id: ViewId) {
  return `${Paths.views}/${id}`;
}

export default Paths;
