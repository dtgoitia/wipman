import datetime
from dataclasses import dataclass
from typing import TypeAlias

Hash: TypeAlias = str
ISODatetimeString: TypeAlias = str  # "2022-07-19T07:11:00+01:00"
MarkdownString: TypeAlias = str
Tag: TypeAlias = str
TaskContent: TypeAlias = MarkdownString | None
TaskId: TypeAlias = str
TaskTitle: TypeAlias = str
ViewContent: TypeAlias = str
ViewId: TypeAlias = str
ViewTitle: TypeAlias = str


@dataclass(frozen=True)
class Task:
    id: TaskId
    title: TaskTitle
    created: datetime.datetime
    updated: datetime.datetime
    tags: frozenset[Tag]
    blocked_by: frozenset[TaskId]
    blocks: frozenset[TaskId]
    completed: bool
    content: TaskContent


@dataclass(frozen=True)
class View:
    id: ViewId
    title: ViewTitle
    created: datetime.datetime
    updated: datetime.datetime
    tags: frozenset[Tag]
    content: ViewContent
