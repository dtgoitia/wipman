import { NO_FILTER_QUERY } from "../../components/SearchBox";
import { FilterQuery, Task } from "../../lib/domain/types";

export function shouldShowTask(task: Task, query: FilterQuery): boolean {
  // show if user didn't use search
  if (query === NO_FILTER_QUERY) {
    return false;
  }

  const _query = query.toLowerCase();

  const searchables = [task.title];
  if (task.tags.size > 0) {
    task.tags.forEach((tag) => searchables.push(tag));
  }
  if (task.content) {
    searchables.push(task.content);
  }

  for (const searchable of searchables) {
    const found = searchable.toLowerCase().includes(_query as string);
    if (found) {
      return true;
    }
  }

  return false;
}
