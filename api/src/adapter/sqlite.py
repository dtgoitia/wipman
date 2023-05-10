import datetime
import logging
import sqlite3
from textwrap import dedent
from typing import TypeAlias

from src.config import Config
from src.model import Task, TaskId, View, ViewId

logger = logging.getLogger(__name__)

SqliteRow: TypeAlias = dict[str, str | int]
Success: TypeAlias = bool

TASKS_TABLE_NAME = "tasks"
VIEWS_TABLE_NAME = "views"


def _set_to_str(str_set: frozenset[str]) -> str:
    return ",".join(sorted(list(str_set)))


def _list_to_str(str_list: list[str]) -> str:
    # IMPORTANT: must preserve order!
    return ",".join(str_list)


def _bool_to_int(value: bool) -> int:
    match value:
        case True:
            return 1
        case False:
            return 0
        case other:
            raise ValueError(
                f"Expected a boolean, but got {other!r} which is a {type(other)}"
            )


def _view_to_row(view: View) -> SqliteRow:
    return {
        "id": view.id,
        "title": view.title,
        "created": view.created.isoformat(),
        "updated": view.updated.isoformat(),
        "tags": _set_to_str(view.tags),
        "task_ids": _list_to_str(view.task_ids),
    }


def _task_to_row(task: Task) -> SqliteRow:
    return {
        "id": task.id,
        "title": task.title,
        "created": task.created.isoformat(),
        "updated": task.updated.isoformat(),
        "tags": _set_to_str(task.tags),
        "blocked_by": _set_to_str(task.blocked_by),
        "blocks": _set_to_str(task.blocks),
        "completed": _bool_to_int(task.completed),
        "content": task.content,
    }


def _int_to_bool(value: int) -> bool:
    match value:
        case 1:
            return True
        case 0:
            return False
        case other:
            raise ValueError(
                f"Expected either a 0 or a 1, but got {other!r} which is a {type(other)}"
            )


def _str_to_set(string: str) -> frozenset[str]:
    return frozenset(item for item in string.split(",") if item)


def _str_to_list(string: str) -> list[str]:
    return string.split(",")


def _result_to_task(result: tuple) -> Task:
    match result:
        case (
            id,
            title,
            created,
            updated,
            tags,
            blocked_by,
            blocks,
            completed,
            content,
        ):
            return Task(
                id=id,
                title=title,
                created=datetime.datetime.fromisoformat(created),
                updated=datetime.datetime.fromisoformat(updated),
                tags=_str_to_set(tags),
                blocked_by=_str_to_set(blocked_by),
                blocks=_str_to_set(blocks),
                completed=_int_to_bool(completed),
                content=content,
            )
        case other:
            raise ValueError(f"Failed to convert DB result into Task: {other}")


def _result_to_view(result: tuple) -> View:
    match result:
        case (id, title, created, updated, tags, task_ids):
            return View(
                id=id,
                title=title,
                created=datetime.datetime.fromisoformat(created),
                updated=datetime.datetime.fromisoformat(updated),
                tags=_str_to_set(tags),
                task_ids=_str_to_list(task_ids),
            )
        case other:
            raise ValueError(f"Failed to convert DB result into View: {other}")


def get_sqlite_connection(config: Config) -> sqlite3.Connection:
    connection = sqlite3.connect(str(config.db_path))
    return connection


class DbClient:
    def __init__(self, config: Config) -> None:
        self.connection = get_sqlite_connection(config=config)

    def is_healthy(self) -> bool:
        _healthy_db_result = (1,)
        with self.connection:
            query = "SELECT 1;"
            results = self.connection.execute(query).fetchone()
            return results == _healthy_db_result

    def create_tables_if_missing(self) -> None:
        try:
            self._create_tasks_table()
            logger.info("'task' table created")
        except Exception:
            logger.info("'task' table already existed, so it has not ben re-created")

        try:
            self._create_views_table()
            logger.info("'views' table created")
        except Exception:
            logger.info("'views' table already existed, so it has not ben re-created")

    def dump_wipman(self, views: set[View], tasks: set[Task]) -> None:
        self._drop_tasks_table_if_exists()
        self._create_tasks_table()

        self._drop_views_table_if_exists()
        self._create_views_table()

        for view in views:
            self.insert_view(view=view)

        for task in tasks:
            self.insert_task(task=task)

    def read_task(self, task_id: TaskId) -> Task | None:
        query = f"SELECT * from {TASKS_TABLE_NAME} WHERE id = ?"
        with self.connection:
            result = self.connection.execute(query, (task_id,)).fetchone()
            if not result:
                return None
            return _result_to_task(result)

    def read_view(self, view_id: ViewId) -> View | None:
        query = f"SELECT * from {VIEWS_TABLE_NAME} WHERE id = ?"
        with self.connection:
            result = self.connection.execute(query, (view_id,)).fetchone()
            if not result:
                return None
            return _result_to_view(result)

    def read_all_tasks(self) -> list[Task]:
        with self.connection:
            query = f"SELECT * FROM {TASKS_TABLE_NAME} t"
            results = self.connection.execute(query).fetchall()
            tasks: list[Task] = list(map(_result_to_task, results))
            return tasks

    def read_all_views(self) -> list[View]:
        with self.connection:
            query = f"SELECT * FROM {VIEWS_TABLE_NAME} t"
            results = self.connection.execute(query).fetchall()
            views: list[View] = list(map(_result_to_view, results))
            return views

    def read_tasks(self, updated_after: datetime.datetime) -> list[Task]:
        with self.connection:
            query = (
                f"SELECT * FROM {TASKS_TABLE_NAME} t"
                f" WHERE datetime('{updated_after.isoformat()}') < t.updated"
            )
            results = self.connection.execute(query).fetchall()
            tasks: list[Task] = list(map(_result_to_task, results))
            return tasks

    def read_views(self, updated_after: datetime.datetime) -> list[View]:
        with self.connection:
            query = (
                f"SELECT * FROM {VIEWS_TABLE_NAME} t"
                f" WHERE datetime('{updated_after.isoformat()}') < t.updated"
            )
            results = self.connection.execute(query).fetchall()
            views: list[View] = list(map(_result_to_view, results))
            return views

    def _drop_tasks_table_if_exists(self) -> None:
        self._drop_table(table_name=TASKS_TABLE_NAME, raise_if_missing=False)

    def _drop_views_table_if_exists(self) -> None:
        self._drop_table(table_name=VIEWS_TABLE_NAME, raise_if_missing=False)

    def _drop_table(self, table_name: str, raise_if_missing: bool = True) -> None:
        try:
            self.connection.execute(f"DROP TABLE {table_name};")
        except:
            if raise_if_missing:
                raise

    def _create_tasks_table(self) -> None:
        table_name = TASKS_TABLE_NAME
        with self.connection:
            logger.debug(f"Creating {table_name!r} table")
            self.connection.execute(
                f"CREATE TABLE {table_name}"
                "(id, title, created, updated, tags, blocked_by, blocks, completed, content)"
                ";"
            )

    def _create_views_table(self) -> None:
        table_name = VIEWS_TABLE_NAME
        with self.connection:
            logger.debug(f"Creating {table_name!r} table")
            self.connection.execute(
                f"CREATE TABLE {table_name} (id, title, created, updated, tags, task_ids);"
            )

    def insert_task(self, task: Task) -> Task:
        query = (
            f"INSERT INTO {TASKS_TABLE_NAME} "
            "(id, title, created, updated, tags, blocked_by, blocks, completed, content)"
            " "
            "VALUES "
            "(?, ?, ?, ?, ?, ?, ?, ?, ?);"
        )
        row = _task_to_row(task=task).values()
        with self.connection:
            self.connection.execute(query, tuple(row))
            inserted = self.read_task(task_id=task.id)
            return inserted

    def insert_view(self, view: View) -> View:
        insert = (
            f"INSERT INTO {VIEWS_TABLE_NAME} "
            "(id, title, created, updated, tags, task_ids)"
            " "
            "VALUES "
            "(?, ?, ?, ?, ?, ?);"
        )

        row = _view_to_row(view=view).values()
        with self.connection:
            self.connection.execute(insert, tuple(row))
            inserted = self.read_view(view_id=view.id)
            return inserted

    def update_task(self, task: Task, upsert_if_needed: bool = False) -> Task:
        row = _task_to_row(task=task).values()

        task_id, *remainder_fields = tuple(row)

        query = dedent(
            f"""
            UPDATE {TASKS_TABLE_NAME}
            SET
                title = ?,
                created = ?,
                updated = ?,
                tags = ?,
                blocked_by = ?,
                blocks = ?,
                completed = ?,
                content = ?
            WHERE id = ?
            ;
            """
        ).strip()

        # must be in the right order
        params = (*remainder_fields, task_id)

        with self.connection:
            self.connection.execute(query, params)
            updated = self.read_task(task_id=task.id)

            if not updated and upsert_if_needed:
                self.insert_task(task=task)
                inserted = self.read_task(task_id=task.id)
                if not inserted:
                    raise FailedToUpsertTask()
                return inserted

            return updated

    def update_view(self, view: View, upsert_if_needed: bool = False) -> View:
        row = _view_to_row(view=view).values()

        view_id, *remainder_fields = tuple(row)

        query = dedent(
            f"""
            UPDATE {VIEWS_TABLE_NAME}
            SET
                title = ?,
                created = ?,
                updated = ?,
                tags = ?,
                task_ids = ?
            WHERE id = ?
            ;
            """
        ).strip()

        # must be in the right order
        params = (*remainder_fields, view_id)

        with self.connection:
            self.connection.execute(query, params)
            updated = self.read_view(view_id=view.id)

            if not updated and upsert_if_needed:
                self.insert_view(view=view)
                inserted = self.read_view(view_id=view.id)
                if not inserted:
                    raise FailedToUpsertView()
                return inserted

            return updated

    def delete_task(self, task_id: TaskId) -> TaskId:
        query = dedent(
            f"""
            DELETE FROM {TASKS_TABLE_NAME}
            WHERE id = ?
            ;
            """
        ).strip()
        params = (task_id,)

        with self.connection:
            cursor = self.connection.execute(query, params)
            success = cursor.rowcount == 1
            if not success:
                raise TaskDeletionError(
                    "Expected to find only 1 row for the provided deletion criteria, but "
                    f"found {cursor.rowcount} instead. Changes will be rolled back"
                )
            return task_id


class TaskDeletionError(Exception):
    ...


class FailedToUpsertTask(Exception):
    ...


class FailedToUpsertView(Exception):
    ...
