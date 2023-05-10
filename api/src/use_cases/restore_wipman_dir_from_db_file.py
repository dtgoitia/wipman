import logging
from pathlib import Path

from src.adapter import fs
from src.adapter.sqlite import DbClient
from src.config import Config
from src.model import Task, TaskId, View

logger = logging.getLogger(__name__)


def _build_task_path(wipman_dir: Path, task: Task) -> Path:
    return wipman_dir / task.id[0:2] / task.id[2:]


def _build_view_path(wipman_dir: Path, view: View) -> Path:
    return wipman_dir / "views" / f"{view.title}.md"


def _create_task_file(config: Config, task: Task) -> None:
    path = _build_task_path(task=task, wipman_dir=config.wipman_dir)
    fs.write_task_file(path=path, task=task)


def _create_view_file(config: Config, view: View, tasks: dict[TaskId, Task]) -> None:
    path = _build_view_path(view=view, wipman_dir=config.wipman_dir)
    fs.write_view_file(path=path, view=view, tasks=tasks)


def restore_wipman_dir_from_db_file(config: Config) -> None:
    db = DbClient(config=config)
    tasks: list[Task] = db.read_all_tasks()
    views: list[View] = db.read_all_views()

    _task_map: dict[TaskId, Task] = {}

    for task in tasks:
        _create_task_file(task=task, config=config)
        _task_map[task.id] = task

    for view in views:
        _create_view_file(view=view, tasks=_task_map, config=config)
