import datetime

from src.model import Task, TaskId


def task(
    id: TaskId | None = None, title: str | None = None, completed: bool | None = None
) -> Task:
    return Task(
        id=id or "xlyckwetrb",
        title=title or "Fix: Task status is not properly propagated",
        created=datetime.datetime.fromisoformat("2022-11-24T13:17:49+00:00"),
        updated=datetime.datetime.fromisoformat("2022-11-25T07:34:37+00:00"),
        tags=frozenset({"foo", "bar"}),
        blocked_by=frozenset(),
        blocks=frozenset(),
        completed=completed if completed is not None else True,
        content=None,
    )
