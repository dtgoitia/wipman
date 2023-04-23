import { Task, View } from "../domain/types";
import { Storage as BrowserStorage } from "./persistence/localStorage";
import { Client } from "browser-http-client";

interface ConstructorArgs {
  local: BrowserStorage;
}

interface GetUpdatedAfterArgs {
  date: Date;
}

export class WipmanApi {
  private local: BrowserStorage;
  private baseUrl: string;

  constructor({ local }: ConstructorArgs) {
    this.local = local;

    // TODO: move this to settings and inject it via constructor
    this.baseUrl = "http://localhost:5000";
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public getLastChanges(): Promise<{ tasks: Task[]; views: View[] }> {
    return this.getUpdatedAfter({ date: this.getLastFetchDate() });
  }

  public async createTask({ task }: { task: Task }): Promise<Task> {
    const url = `${this.baseUrl}/task`;
    const payload = { task: taskToJson(task) };

    const result = await Client.post(url, payload).then((result) => {
      return result.match({
        Ok: ({ data }) => {
          return parseTask(data.updated_task);
        },
        Err: (error) => {
          throw new Error(error as unknown as string);
        },
      });
    });

    return result;
  }

  public async updateTask({ task }: { task: Task }): Promise<Task> {
    const url = `${this.baseUrl}/task`;
    const payload = { task: taskToJson(task) };

    const result = await Client.put(url, payload).then((result) => {
      return result.match({
        Ok: ({ data }) => {
          return parseTask(data.updated_task);
        },
        Err: (error) => {
          throw new Error(error as unknown as string);
        },
      });
    });

    return result;
  }

  private async getUpdatedAfter({
    date,
  }: GetUpdatedAfterArgs): Promise<{ tasks: Task[]; views: View[] }> {
    const url = `${this.baseUrl}/get-all`;
    const result = await Client.get(url).then((result) => {
      return result.match({
        Ok: ({ data }) => ({ tasks: data.tasks.map(parseTask), views: [] }),
        Err: (error) => {
          throw new Error(error as unknown as string);
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
