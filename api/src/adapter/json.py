import datetime
from pprint import pprint
from typing import Any, TypeAlias

from src.model import Task, View

JsonDict: TypeAlias = dict[str, Any]


def _set_to_json(str_set: frozenset[str]) -> str:
    return ",".join(sorted(str_set))


def _json_to_set(raw: str) -> frozenset[str]:
    return frozenset(item for item in raw.split(",") if item)


def task_to_json(task: Task) -> JsonDict:
    return {
        "id": task.id,
        "title": task.title,
        "created": task.created.isoformat(),
        "updated": task.updated.isoformat(),
        "tags": _set_to_json(task.tags),
        "blocked_by": _set_to_json(task.blocked_by),
        "blocks": _set_to_json(task.blocks),
        "completed": task.completed,
        "content": task.content,
    }


def json_to_task(raw: JsonDict) -> Task:
    return Task(
        id=raw["id"],
        title=raw["title"],
        created=datetime.datetime.fromisoformat(raw["created"]),
        updated=datetime.datetime.fromisoformat(raw["updated"]),
        tags=_json_to_set(raw["tags"]),
        blocked_by=_json_to_set(raw["blocked_by"]),
        blocks=_json_to_set(raw["blocks"]),
        completed=raw["completed"],
        content=raw["content"],
    )


def view_to_json(view: View) -> JsonDict:
    return {
        "id": view.id,
        "title": view.title,
        "created": view.created.isoformat(),
        "updated": view.updated.isoformat(),
        "tags": _set_to_json(view.tags),
        "task_ids": view.task_ids,
    }


def json_to_view(raw: JsonDict) -> View:
    return View(
        id=raw["id"],
        title=raw["title"],
        created=datetime.datetime.fromisoformat(raw["created"]),
        updated=datetime.datetime.fromisoformat(raw["updated"]),
        tags=_json_to_set(raw["tags"]),
        task_ids=raw["task_ids"],
    )
