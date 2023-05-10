import datetime
from pathlib import Path

from src.adapter.fs import (
    load_wipman_dir,
    read_task_file,
    read_view_file,
    write_task_file,
    write_view_file,
)
from src.config import Config
from src.model import Task, TaskId, View
from tests.factories import task


def test_read_task_file(tmp_path: Path) -> None:
    path = tmp_path / "task"

    path.write_text(
        "id=xlyckwetrb\n"
        "title=Fix: Task status is not properly propagated\n"
        "created=2022-11-24T13:17:49+00:00\n"
        "updated=2022-11-25T07:34:37+00:00\n"
        "tags=bar,foo\n"
        "blockedBy=\n"
        "blocks=\n"
        "completed=true\n"
        "---\n"
        "Steps to reproduce:\n"
        "1. Mark a Task as completed from a view.\n"
        "2. Save.\n"
        "3. It will get marked as complete ✅\n"
        "4. Now edit the View again to set it to incomplete.\n"
        "5. The changes will not propagate correctly :S -- sounds similar to the one you had with Views some time ago.\n"
        ""
    )

    task = read_task_file(path=path)

    assert task == Task(
        id="xlyckwetrb",
        title="Fix: Task status is not properly propagated",
        created=datetime.datetime.fromisoformat("2022-11-24T13:17:49+00:00"),
        updated=datetime.datetime.fromisoformat("2022-11-25T07:34:37+00:00"),
        tags=frozenset({"foo", "bar"}),
        blocked_by=frozenset(),
        blocks=frozenset(),
        completed=True,
        content=(
            "Steps to reproduce:\n"
            "1. Mark a Task as completed from a view.\n"
            "2. Save.\n"
            "3. It will get marked as complete ✅\n"
            "4. Now edit the View again to set it to incomplete.\n"
            "5. The changes will not propagate correctly :S -- sounds similar to the one you had with Views some time ago.\n"
        ),
    )


def test_read_task_file_without_content(tmp_path: Path) -> None:
    path = tmp_path / "task"

    path.write_text(
        "id=xlyckwetrb\n"
        "title=Fix: Task status is not properly propagated\n"
        "created=2022-11-24T13:17:49+00:00\n"
        "updated=2022-11-25T07:34:37+00:00\n"
        "tags=bar,foo\n"
        "blockedBy=\n"
        "blocks=\n"
        "completed=true\n"
        "---\n"
        ""
    )

    task = read_task_file(path=path)

    assert task == Task(
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


def test_write_task_file(tmp_path: Path) -> None:
    task = Task(
        id="xlyckwetrb",
        title="Fix: Task status is not properly propagated",
        created=datetime.datetime.fromisoformat("2022-11-24T13:17:49+00:00"),
        updated=datetime.datetime.fromisoformat("2022-11-25T07:34:37+00:00"),
        tags=frozenset({"foo", "bar"}),
        blocked_by=frozenset(),
        blocks=frozenset(),
        completed=True,
        content=(
            "Steps to reproduce:\n"
            "1. Mark a Task as completed from a view.\n"
            "2. Save.\n"
            "3. It will get marked as complete ✅\n"
            "4. Now edit the View again to set it to incomplete.\n"
            "5. The changes will not propagate correctly :S -- sounds similar to the one you had with Views some time ago.\n"
        ),
    )

    path = tmp_path / "task"
    write_task_file(path=path, task=task)

    assert path.read_text() == (
        "id=xlyckwetrb\n"
        "title=Fix: Task status is not properly propagated\n"
        "created=2022-11-24T13:17:49+00:00\n"
        "updated=2022-11-25T07:34:37+00:00\n"
        "tags=bar,foo\n"
        "blockedBy=\n"
        "blocks=\n"
        "completed=true\n"
        "---\n"
        "Steps to reproduce:\n"
        "1. Mark a Task as completed from a view.\n"
        "2. Save.\n"
        "3. It will get marked as complete ✅\n"
        "4. Now edit the View again to set it to incomplete.\n"
        "5. The changes will not propagate correctly :S -- sounds similar to the one you had with Views some time ago.\n"
        ""
    )


def test_write_task_file_without_content(tmp_path: Path) -> None:
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

    path = tmp_path / "task"
    write_task_file(path=path, task=task)

    assert path.read_text() == (
        "id=xlyckwetrb\n"
        "title=Fix: Task status is not properly propagated\n"
        "created=2022-11-24T13:17:49+00:00\n"
        "updated=2022-11-25T07:34:37+00:00\n"
        "tags=bar,foo\n"
        "blockedBy=\n"
        "blocks=\n"
        "completed=true\n"
        "---\n"
    )


def test_read_view_file(tmp_path: Path) -> None:
    path = tmp_path / "task"

    path.write_text(
        "id=0000000000\n"
        "title=backlog\n"
        "created=2022-10-01T18:00:00+00:00\n"
        "updated=2022-10-01T18:00:00+00:00\n"
        "tags=\n"
        "---\n"
        "- [ ] On View open in editor, automatically select markdown language  [dkzjtmtmap](../dk/zjtmtmap)\n"
        "- [x] Fix: Task status is not properly propagated  [xlyckwetrb](../xl/yckwetrb)\n"
        ""
    )

    view = read_view_file(path=path)

    assert view == View(
        id="0000000000",
        title="backlog",
        created=datetime.datetime.fromisoformat("2022-10-01T18:00:00+00:00"),
        updated=datetime.datetime.fromisoformat("2022-10-01T18:00:00+00:00"),
        tags=frozenset(),
        task_ids=["dkzjtmtmap", "xlyckwetrb"],
    )


def test_write_view_file(tmp_path: Path) -> None:
    view = View(
        id="0000000000",
        title="backlog",
        created=datetime.datetime.fromisoformat("2022-10-01T18:00:00+00:00"),
        updated=datetime.datetime.fromisoformat("2022-10-01T18:00:00+00:00"),
        tags=frozenset(),
        task_ids=["dkzjtmtmap", "xlyckwetrb"],
    )

    path = tmp_path / "task"
    write_view_file(
        path=path,
        view=view,
        tasks={
            "dkzjtmtmap": task(
                id="dkzjtmtmap",
                title="On View open in editor, automatically select markdown language",
                completed=False,
            ),
            "xlyckwetrb": task(
                id="xlyckwetrb",
                title="Fix: Task status is not properly propagated",
                completed=True,
            ),
        },
    )

    assert path.read_text() == (
        "id=0000000000\n"
        "title=backlog\n"
        "created=2022-10-01T18:00:00+00:00\n"
        "updated=2022-10-01T18:00:00+00:00\n"
        "tags=\n"
        "---\n"
        "- [ ] On View open in editor, automatically select markdown language  [dkzjtmtmap](../dk/zjtmtmap)\n"
        "- [x] Fix: Task status is not properly propagated  [xlyckwetrb](../xl/yckwetrb)\n"
        ""
    )


def _build_fake_wipman_dir(container: Path) -> Path:
    """
    container/
        wipman/
            dk/
                zjtmtmap
            views/
                backlog.view
            xl/
                yckwetrb
    """
    wipman_dir = container / "wipman"
    views_dir = wipman_dir / "views"

    backlog = View(
        id="0000000000",
        title="backlog",
        created=datetime.datetime.fromisoformat("2022-10-01T18:00:00.000Z"),
        updated=datetime.datetime.fromisoformat("2022-10-01T18:00:00.000Z"),
        tags=frozenset(),
        task_ids=["dkzjtmtmap", "xlyckwetrb"],
    )

    task_a = Task(
        id="dkzjtmtmap",
        title="On View open in editor, automatically select markdown language",
        created=datetime.datetime.fromisoformat("2022-12-01T08:17:39.869Z"),
        updated=datetime.datetime.fromisoformat("2022-12-01T08:17:44.993Z"),
        tags=set("wipman"),
        blocked_by=frozenset(),
        blocks=frozenset(),
        completed=False,
        content="",
    )

    task_b = Task(
        id="xlyckwetrb",
        title="Fix: Task status is not properly propagated",
        created=datetime.datetime.fromisoformat("2022-11-24T13:17:49.455Z"),
        updated=datetime.datetime.fromisoformat("2022-11-25T07:34:37.623Z"),
        tags=frozenset(),
        blocked_by=frozenset(),
        blocks=frozenset(),
        completed=True,
        content=(
            "Steps to reproduce:\n"
            "1. Mark a Task as completed from a view.\n"
            "2. Save.\n"
            "3. It will get marked as complete ✅\n"
            "4. Now edit the View again to set it to incomplete.\n"
            "5. The changes will not propagate correctly :S -- sounds similar to the one you had with Views some time ago.\n"
        ),
    )

    def _task_path(wipman_dir: Path, task_id: TaskId) -> Path:
        path = wipman_dir / task_id[0:2] / task_id[2:]
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    task_a_path = _task_path(wipman_dir=wipman_dir, task_id=task_a.id)
    task_b_path = _task_path(wipman_dir=wipman_dir, task_id=task_b.id)

    backlog_path = views_dir = views_dir / "backlog.view"

    write_task_file(path=task_a_path, task=task_a)
    write_task_file(path=task_b_path, task=task_b)
    write_view_file(
        path=backlog_path,
        view=backlog,
        tasks={
            task_a.id: task_a,
            task_b.id: task_b,
        },
    )

    return wipman_dir


def test_load_wipman_dir(tmp_path: Path, test_config: Config) -> None:
    fake_wipman_dir = _build_fake_wipman_dir(container=tmp_path)
    config = test_config.extend(wipman_dir=fake_wipman_dir)

    views, tasks = load_wipman_dir(config=config)

    assert len(views) == 1
    assert len(tasks) == 2

    # TODO: add more assertions
