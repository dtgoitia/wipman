import datetime
import os
from dataclasses import replace
from pathlib import Path

from src.adapter.sqlite import DbClient
from src.config import Config
from src.model import Task, View
from src.use_cases.files_to_db import dump_wipman_dir_to_db


def test_read_tasks_and_views(test_config: Config) -> None:
    config = test_config.extend(wipman_dir=Path(os.environ["WIPMAN_DIR"]))
    dump_wipman_dir_to_db(config=config)

    t = datetime.datetime(2021, 12, 30)

    db = DbClient(config=config)
    tasks = db.read_tasks(updated_after=t)
    views = db.read_views(updated_after=t)

    assert tasks is not None
    assert views is not None


def test_update_task(test_config: Config, tmp_path: Path) -> None:
    config = test_config.extend(
        wipman_dir=tmp_path / "wipman_dir",
        db_path=tmp_path / "db.db",
    )

    db = DbClient(config=config)
    db._create_tasks_table()

    def _count_tasks_in_db() -> int:
        return db.connection.execute("SELECT count(0) FROM tasks;").fetchone()[0]

    task = Task(
        id="xlyckwetrb",
        title="Fix: Task status is not properly propagated",
        created=datetime.datetime.fromisoformat("2022-11-24T13:17:49+00:00"),
        updated=datetime.datetime.fromisoformat("2022-11-25T07:34:37+00:00"),
        tags=frozenset({"foo", "bar"}),
        blocked_by=frozenset(),
        blocks=frozenset(),
        completed=True,
        content=None,
    )

    assert _count_tasks_in_db() == 0

    inserted = db.insert_task(task=task)
    assert inserted == task
    assert _count_tasks_in_db() == 1

    task2 = replace(task, content="Foo")

    updated = db.update_task(task=task2)
    assert updated == task2

    assert _count_tasks_in_db() == 1


def test_update_view(test_config: Config, tmp_path: Path) -> None:
    config = test_config.extend(
        wipman_dir=tmp_path / "wipman_dir",
        db_path=tmp_path / "db.db",
    )

    db = DbClient(config=config)
    db._create_views_table()

    def _count_views_in_db() -> int:
        return db.connection.execute("SELECT count(0) FROM views;").fetchone()[0]

    view = View(
        id="0000000000",
        title="backlog",
        created=datetime.datetime.fromisoformat("2022-10-01T18:00:00+00:00"),
        updated=datetime.datetime.fromisoformat("2022-10-01T18:00:00+00:00"),
        tags=frozenset(),
        task_ids=[],
    )

    assert _count_views_in_db() == 0

    inserted = db.insert_view(view=view)
    assert inserted == view
    assert _count_views_in_db() == 1

    view2 = replace(view, title="best backlog ever")

    updated = db.update_view(view=view2)
    assert updated == view2

    assert _count_views_in_db() == 1
