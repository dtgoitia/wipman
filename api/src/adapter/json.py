from typing import Any, TypeAlias

import apischema
from src.model import Task, View

JsonDict: TypeAlias = dict[str, Any]


def task_to_json(task: Task) -> JsonDict:
    return apischema.serialize(Task, task)


def json_to_task(raw: JsonDict) -> Task:
    return apischema.deserialize(Task, raw)


def view_to_json(view: View) -> JsonDict:
    return apischema.serialize(View, view)


def json_to_view(raw: JsonDict) -> View:
    return apischema.deserialize(View, raw)
