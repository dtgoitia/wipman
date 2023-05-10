import datetime
import re
from collections import defaultdict
from pathlib import Path

from src.config import Config
from src.model import Task, TaskId, View

END_OF_FILE_EMPTY_LINE = ""


def _str_to_bool(string: str) -> bool:
    match string:
        case "true":
            return True
        case "false":
            return False
        case other:
            raise ValueError(f'Expected "true" or "false", but got {other!r}')


def _str_to_frozenset(string: str) -> frozenset[str]:
    return frozenset((item for item in string.split(",") if item))


def read_task_file(path: Path) -> Task:
    content_delimiter_found = False
    tmp: defaultdict[str, str] = defaultdict(str)

    with path.open("r") as f:
        for line in f:
            if content_delimiter_found:
                tmp["content"] += line
                continue

            line = line.strip()
            if line == "---":
                content_delimiter_found = True
                continue

            key, value = line.split("=", maxsplit=1)
            tmp[key] = value

    data = dict(tmp)

    return Task(
        id=data["id"],
        title=data["title"],
        created=datetime.datetime.fromisoformat(data["created"]),
        updated=datetime.datetime.fromisoformat(data["updated"]),
        tags=_str_to_frozenset(data["tags"]),
        blocked_by=_str_to_frozenset(data["blockedBy"]),
        blocks=_str_to_frozenset(data["blocks"]),
        completed=_str_to_bool(data["completed"]),
        content=data.get("content"),
    )


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
        task.content if task.content else "",
    ]

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines))


_TASK_ID_IN_VIEW_LINE_PATTERN = re.compile(r"^.*\[([a-z]{10})\]")


class ReadViewError(Exception):
    ...


def _extract_task_id(*, line: str) -> TaskId:
    matches = _TASK_ID_IN_VIEW_LINE_PATTERN.match(line)
    if matches is None:
        raise ReadViewError(
            f"Failed to extract the Task ID from View content line: {line!r}"
        )

    return matches.group(1)


def read_view_file(path: Path) -> View:
    content_delimiter_found = False
    tmp: defaultdict[str, str] = defaultdict(str)
    task_ids: list[TaskId] = []

    with path.open("r") as f:
        for line in f:
            if content_delimiter_found:
                # Extract task ID from View content line
                task_id = _extract_task_id(line=line)
                task_ids.append(task_id)
                continue

            line = line.strip()
            if line == "---":
                content_delimiter_found = True
                continue

            key, value = line.split("=")
            tmp[key] = value

    data = dict(tmp)

    return View(
        id=data["id"],
        title=data["title"],
        created=datetime.datetime.fromisoformat(data["created"]),
        updated=datetime.datetime.fromisoformat(data["updated"]),
        tags=_str_to_frozenset(data["tags"]),
        task_ids=task_ids,
    )


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
        task = tasks[task_id]
        completed_mark = "x" if task.completed else " "
        view_content_line = (
            f"- [{completed_mark}]"
            f" {task.title}"
            "  "  # double space!
            f"[{task_id}](../{task_id[0:2]}/{task_id[2:]})"
        )
        lines.append(view_content_line)

    # end of file newline
    lines.append("")

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines))


def load_wipman_dir(config: Config) -> tuple[list[View], set[Task]]:
    def _ignore_hidden(path: Path) -> bool:
        return not path.name.startswith(".")

    def _is_task_dir(path: Path) -> bool:
        return path.is_dir() and len(path.name) == 2

    def _is_task_file(path: Path) -> bool:
        return path.is_file() and _is_task_dir(path.parent) and len(path.name) == 8

    views_dir = config.wipman_dir / "views"
    views = [read_view_file(path) for path in views_dir.glob("*")]

    non_hidden = filter(_ignore_hidden, config.wipman_dir.rglob("*"))
    tasks_paths = filter(_is_task_file, non_hidden)
    tasks = {read_task_file(path) for path in tasks_paths}
    return views, tasks
