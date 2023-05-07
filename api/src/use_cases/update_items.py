from src.adapter.sqlite import DbClient
from src.config import Config
from src.model import Task, TaskId, View


def create_task(task: Task, config: Config) -> Task:
    db = DbClient(config=config)
    created = db.insert_task(task=task)
    return created


def update_task(task: Task, config: Config) -> Task:
    db = DbClient(config=config)
    updated = db.update_task(task=task, upsert_if_needed=True)
    return updated


def update_view(view: View, config: Config) -> View:
    db = DbClient(config=config)
    updated = db.update_view(view=view, upsert_if_needed=True)
    return updated


def delete_task(task_id: TaskId, config: Config) -> TaskId:
    db = DbClient(config=config)
    deleted_id = db.delete_task(task_id=task_id)
    return deleted_id
