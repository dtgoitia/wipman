import datetime

from src.adapter.sqlite import DbClient
from src.config import Config
from src.model import Task, View


def read_tasks_updated_after(t: datetime.datetime, config: Config) -> set[Task]:
    db = DbClient(config=config)
    tasks = db.read_tasks(updated_after=t)
    return set(tasks)


def read_view_updated_after(t: datetime.datetime, config: Config) -> list[View]:
    db = DbClient(config=config)
    views = db.read_views(updated_after=t)
    return views
