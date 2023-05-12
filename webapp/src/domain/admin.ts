import { Storage as BrowserStorage } from "../services/persistence/localStorage";

interface AdminArgs {
  local: BrowserStorage;
}
export class Admin {
  private local: BrowserStorage;
  constructor({ local }: AdminArgs) {
    this.local = local;
  }

  public deleteTasks(): void {
    console.warn(`Admin.deleteTask::deleting tasks...`);
    this.local.tasks.delete();
    console.warn(`Admin.deleteTask::tasks deleted`);
  }
  public deleteViews(): void {
    console.warn(`Admin.deleteTask::deleting views...`);
    this.local.views.delete();
    console.warn(`Admin.deleteTask::views deleted`);
  }
}
