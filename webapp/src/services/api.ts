import { SettingsManager } from "../domain/settings";
import { Task, TaskId, View, ViewId } from "../domain/types";
import { ErrorsService } from "./errors";
import { Client } from "browser-http-client";

interface ConstructorArgs {
  errors: ErrorsService;
  settingsManager: SettingsManager;
}

interface GetUpdatedAfterArgs {
  date: Date;
}

export class WipmanApi {
  private settingsManager: SettingsManager;
  private errors: ErrorsService;

  constructor({ errors, settingsManager }: ConstructorArgs) {
    this.errors = errors;
    this.settingsManager = settingsManager;
  }

  public isOnline(): boolean {
    const apiUrl = this.settingsManager.settings.apiUrl;
    if (apiUrl === undefined) return false;
    if (this.apiIsInLocalhost()) return true;
    return navigator.onLine;
  }

  private isApiUrlInSettings(): boolean {
    return this.settingsManager.settings.apiUrl !== undefined;
  }

  private apiIsInLocalhost(): boolean {
    const apiUrl = this.settingsManager.settings.apiUrl;
    if (apiUrl === undefined) return false;

    if (apiUrl.startsWith("http://localhost")) return true;
    if (apiUrl.startsWith("http://127.0.0.1")) return true;

    return false;
  }

  public getLastChanges(): Promise<{ tasks: Task[]; views: View[] }> {
    const earlyReturn = Promise.resolve({ tasks: [], views: [] });
    if (this.isApiUrlInSettings() === false) {
      console.debug(
        `${WipmanApi.name}.${this.getLastChanges.name}::no API URL found in Settings`
      );
      return earlyReturn;
    }

    if (this.isOnline() === false) {
      console.debug(
        `${WipmanApi.name}.${this.getLastChanges.name}::we are offline`
      );
      return earlyReturn;
    }

    return this.getUpdatedAfter({ date: this.getLastFetchDate() });
  }

  public async createTask({ task }: { task: Task }): Promise<Task> {
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {}); // eslint-disable-line  @typescript-eslint/no-empty-function
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
      return new Promise(() => {}); // eslint-disable-line  @typescript-eslint/no-empty-function
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
      return new Promise(() => {}); // eslint-disable-line  @typescript-eslint/no-empty-function
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
      return new Promise(() => {}); // eslint-disable-line  @typescript-eslint/no-empty-function
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

  public async updateView({ view }: { view: View }): Promise<View> {
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {}); // eslint-disable-line  @typescript-eslint/no-empty-function
    }
    const url = `${baseUrl}/view`;
    const payload = { view: viewToJson(view) };

    const result = await Client.put(url, payload).then((result) => {
      return result.match({
        Ok: ({ data }) => parseView(data.updated_view),
        Err: (error) => {
          const reason =
            "response" in error && error.response.status === 0
              ? "Cannot reach the server"
              : JSON.stringify(error, null, 2);

          this.errors.add({
            header: "Failed to update View",
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
      return new Promise(() => {}); // eslint-disable-line  @typescript-eslint/no-empty-function
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
    console.warn(
      `${WipmanApi.name}.${this.getUpdatedAfter.name}::you are not using date (${date})`
    );
    const baseUrl = this.getBaseUrl();
    if (baseUrl === undefined) {
      return new Promise(() => {}); // eslint-disable-line  @typescript-eslint/no-empty-function
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
  tags: string[];
  blocked_by: string[];
  blocks: string[];
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

function parseSet<T>(raw: T[]): Set<T> {
  return new Set<T>(raw.filter((item) => item !== undefined));
}

function setToJson<T>(set: Set<T>): T[] {
  return [...set.values()];
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
  tags: string[];
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
