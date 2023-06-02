import logging
from pathlib import Path

from src.model import Task, TaskId, View

logger = logging.getLogger(__name__)

END_OF_FILE_EMPTY_LINE = ""


def _set_to_str(str_set: frozenset[str]) -> str:
    return ",".join(sorted(list(str_set)))


def _bool_to_str(value: bool) -> str:
    match value:
        case True:
            return "true"
        case False:
            return "false"
        case other:
            raise ValueError(
                f"Expected a boolean, but got {other!r} which is a {type(other)}"
            )


def write_task_file(path: Path, task: Task) -> None:
    lines: list[str] = [
        f"id={task.id}",
        f"title={task.title}",
        f"created={task.created.isoformat()}",
        f"updated={task.updated.isoformat()}",
        f"tags={_set_to_str(task.tags)}",
        f"blockedBy={_set_to_str(task.blocked_by)}",
        f"blocks={_set_to_str(task.blocks)}",
        f"completed={_bool_to_str(task.completed)}",
        "---",
        task.content if task.content else END_OF_FILE_EMPTY_LINE,
    ]

    content = "\n".join(lines)
    if content[-1] != "\n":
        content = f"{content}\n"

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


def write_view_file(path: Path, view: View, tasks: dict[TaskId, Task]) -> None:
    lines: list[str] = [
        f"id={view.id}",
        f"title={view.title}",
        f"created={view.created.isoformat()}",
        f"updated={view.updated.isoformat()}",
        f"tags={_set_to_str(view.tags)}",
        "---",
    ]

    for task_id in view.task_ids:
        try:
            task = tasks[task_id]
        except:
            logger.warning(f"Task ID {task_id!r} not found among fetched tasks")
            continue
        completed_mark = "x" if task.completed else " "
        view_content_line = (
            f"- [{completed_mark}]"
            f" {task.title}"
            "  "  # double space!
            f"[{task_id}](../{task_id[0:2]}/{task_id[2:]})"
        )
        lines.append(view_content_line)

    lines.append(END_OF_FILE_EMPTY_LINE)

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines))
