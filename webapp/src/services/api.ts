import { SettingsManager } from "../domain/settings";
import { Task, TaskId, View, ViewId } from "../domain/types";
import { ErrorsService } from "./errors";
import { Storage as BrowserStorage } from "./persistence/localStorage";
import { Client } from "browser-http-client";

interface ConstructorArgs {
  local: BrowserStorage;
  errors: ErrorsService;
  settingsManager: SettingsManager;
}

interface GetUpdatedAfterArgs {
  date: Date;
}

export class WipmanApi {
  private local: BrowserStorage;
  private settingsManager: SettingsManager;
  private errors: ErrorsService;

  constructor({ local, errors, settingsManager }: ConstructorArgs) {
    this.local = local;
    this.errors = errors;
    this.settingsManager = settingsManager;
  }

  public isOnline(): boolean {
    const apiUrl = this.settingsManager.settings.apiUrl;
    if (apiUrl === undefined) return false;
    if (this.apiIsInLocalhost()) return true;
    return navigator.onLine;
  }

  private apiIsInLocalhost(): boolean {
    const apiUrl = this.settingsManager.settings.apiUrl;
    if (apiUrl === undefined) return false;

    if (apiUrl.startsWith("http://localhost")) return true;
    if (apiUrl.startsWith("http://127.0.0.1")) return true;

    return false;
  }

  public getLastChanges(): Promise<{ tasks: Task[]; views: View[] }> {
    return this.getUpdatedAfter({ date: this.getLastFetchDate() });
  }

  public async createTask({ task }: { task: Task }): Promise<Task> {
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {});
    }
    const url = `${baseUrl}/task`;
    const payload = { task: taskToJson(task) };

    const result = await Client.post(url, payload).then((result) => {
      return result.match({
        Ok: ({ data }) => parseTask(data.created_task),
        Err: (error) => {
          const reason =
            "response" in error && error.response.status === 0
              ? "Cannot reach the server"
              : JSON.stringify(error, null, 2);

          this.errors.add({
            header: "Failed to create Task",
            description: reason,
          });
          return {} as Task;
        },
      });
    });

    return result;
  }

  public async updateTask({ task }: { task: Task }): Promise<Task> {
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {});
    }
    const url = `${baseUrl}/task`;
    const payload = { task: taskToJson(task) };

    const result = await Client.put(url, payload).then((result) => {
      return result.match({
        Ok: ({ data }) => parseTask(data.updated_task),
        Err: (error) => {
          const reason =
            "response" in error && error.response.status === 0
              ? "Cannot reach the server"
              : JSON.stringify(error, null, 2);

          this.errors.add({
            header: "Failed to update Task",
            description: reason,
          });
          return {} as Task;
        },
      });
    });

    return result;
  }

  public async deleteTask({ taskId }: { taskId: TaskId }): Promise<TaskId> {
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {});
    }
    const url = `${baseUrl}/task/${taskId}`;

    const result = await Client.delete(url).then((result) => {
      return result.match({
        Ok: ({ data }) => data.deleted_task_id as TaskId,
        Err: (error) => {
          const reason =
            "response" in error && error.response.status === 0
              ? "Cannot reach the server"
              : JSON.stringify(error, null, 2);

          this.errors.add({
            header: "Failed to delete Task",
            description: reason,
          });
          return undefined as unknown as TaskId;
        },
      });
    });

    return result;
  }

  public async createView({ view }: { view: View }): Promise<View> {
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {});
    }

    const url = `${baseUrl}/view`;
    const payload = { view: viewToJson(view) };

    const result = await Client.post(url, payload).then((result) => {
      return result.match({
        Ok: ({ data }) => parseView(data.created_view),
        Err: (error) => {
          const reason =
            "response" in error && error.response.status === 0
              ? "Cannot reach server"
              : JSON.stringify(error, null, 2);

          this.errors.add({
            header: "Failed to create View",
            description: reason,
          });
          return {} as View;
        },
      });
    });

    return result;
  }

  public async deleteView({ viewId }: { viewId: ViewId }): Promise<ViewId> {
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {});
    }
    const url = `${baseUrl}/view/${viewId}`;

    const result = await Client.delete(url).then((result) => {
      return result.match({
        Ok: ({ data }) => data.deleted_view_id as ViewId,
        Err: (error) => {
          const reason =
            "response" in error && error.response.status === 0
              ? "Cannot reach the server"
              : JSON.stringify(error, null, 2);

          this.errors.add({
            header: "Failed to delete View",
            description: reason,
          });
          return undefined as unknown as ViewId;
        },
      });
    });

    return result;
  }

  private getBaseUrl(): string | undefined {
    const url = this.settingsManager.settings.apiUrl;
    if (url === undefined) {
      this.errors.add({
        header: "API URL not found",
        description: "Could not find API URL in Settings",
      });
      return;
    }

    return url;
  }

  private async getUpdatedAfter({
    date,
  }: GetUpdatedAfterArgs): Promise<{ tasks: Task[]; views: View[] }> {
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {});
    }
    const url = `${baseUrl}/get-all`;
    const result = await Client.get(url).then((result) => {
      return result.match({
        Ok: ({ data }) => ({
          tasks: data.tasks.map(parseTask),
          views: data.views.map(parseView),
        }),
        Err: (error) => {
          const reason =
            "response" in error && error.response.status === 0
              ? "Cannot reach the server"
              : JSON.stringify(error, null, 2);

          this.errors.add({
            header: `Failed while fetching changes from API after date`,
            description: reason,
          });
          return { tasks: [], views: [] };
        },
      });
    });
    return result;
  }

  private getLastFetchDate(): Date {
    return new Date(0); // old date in the past
    // if (this.local.lastBackendFetch.exists() === false) {
    //   console.log("Date of last API fetch not found in browser storage");
    //   return new Date(0); // old date in the past
    // }

    // const raw = this.local.lastBackendFetch.read() as string;

    // return new Date(raw);
  }
}

interface ApiTask {
  id: string;
  title: string;
  content: string;
  created: string;
  updated: string;
  tags: string;
  blocked_by: string;
  blocks: string;
  completed: boolean;
}

function parseTask(apiTask: ApiTask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    content: apiTask.content,
    created: apiTask.created,
    updated: apiTask.updated,
    tags: parseSet(apiTask.tags),
    blockedBy: parseSet(apiTask.blocked_by),
    blocks: parseSet(apiTask.blocks),
    completed: apiTask.completed,
  };
}

function parseSet(raw: string): Set<string> {
  return new Set<string>(raw.split(",").filter((item) => item));
}

function setToJson(set: Set<string>): string {
  return [...set.values()].sort().join(",");
}

function taskToJson(task: Task): ApiTask {
  return {
    id: task.id,
    title: task.title,
    content: task.content,
    created: task.created,
    updated: task.updated,
    tags: setToJson(task.tags),
    blocked_by: setToJson(task.blockedBy),
    blocks: setToJson(task.blocks),
    completed: task.completed,
  };
}

interface ApiView {
  id: string;
  title: string;
  created: string;
  updated: string;
  tags: string;
  task_ids: string[];
}

function parseView(apiView: ApiView): View {
  return {
    id: apiView.id,
    title: apiView.title,
    created: apiView.created,
    updated: apiView.updated,
    tags: parseSet(apiView.tags),
    tasks: apiView.task_ids,
  };
}

function viewToJson(view: View): ApiView {
  return {
    id: view.id,
    title: view.title,
    created: view.created,
    updated: view.updated,
    tags: setToJson(view.tags),
    task_ids: view.tasks,
  };
}
