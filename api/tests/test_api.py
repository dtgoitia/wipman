import datetime

import pytest
from flask import Flask
from flask.testing import FlaskClient
from src import model
from src.adapter.json import json_to_task, json_to_view, task_to_json, view_to_json
from src.api import app


@pytest.fixture
def test_app() -> Flask:
    app.config.update({"TESTING": True})
    return app


@pytest.fixture
def test_client(test_app: Flask) -> FlaskClient:
    return test_app.test_client()


@pytest.mark.skip(reason="used for development only")
def test_changes_after_date(test_client: FlaskClient) -> None:
    t = datetime.datetime(2023, 1, 1)
    response = test_client.get(
        "/changes",
        json={"after": t.isoformat()},
    )
    data = response.json
    breakpoint()
    print()


@pytest.mark.skip(reason="used for development only")
def test_update_task(test_client: FlaskClient) -> None:
    response = test_client.put(
        "/task",
        json={
            "task": {
                "id": "dohxduozbs",
                "title": "On command RefreshViews, scan all view files, and add/remove/update views accordingly",
                "created": "2022-10-06T11:53:52.102000+00:00",
                "updated": "2022-11-22T18:35:11.292000+00:00",
                "tags": "wipman",
                "blocked_by": "",
                "blocks": "",
                "completed": False,
                "content": "foo",
            },
        },
    )
    data = response.json
    breakpoint()
    print()


@pytest.mark.skip(reason="used for development only")
def test_update_view(test_client: FlaskClient) -> None:
    response = test_client.put(
        "/view",
        json={
            "view": {
                "id": "tbndhderkz",
                "title": "expenses form",
                "created": "2022-12-07T19:54:15.282000+00:00",
                "updated": "2022-12-07T19:54:15.282000+00:00",
                "tags": "expenses_form",
                "content": None,
            },
        },
    )
    data = response.json
    breakpoint()
    print()


def test_serde_task_as_json() -> None:
    tz = datetime.timezone(datetime.timedelta(seconds=3600))

    task = model.Task(
        id="dohxduozbs",
        title="task title",
        created=datetime.datetime(2023, 6, 2, 7, 37, 39, tzinfo=tz),
        updated=datetime.datetime(2023, 6, 2, 7, 37, 41, tzinfo=tz),
        tags=frozenset({"tag1"}),
        blocked_by=frozenset(),
        blocks=frozenset(),
        completed=False,
        content="task content",
    )

    raw = task_to_json(task=task)
    assert raw == {
        "id": "dohxduozbs",
        "title": "task title",
        "created": "2023-06-02T07:37:39+01:00",
        "updated": "2023-06-02T07:37:41+01:00",
        "tags": ["tag1"],
        "blocked_by": [],
        "blocks": [],
        "completed": False,
        "content": "task content",
    }

    task_2 = json_to_task(raw=raw)

    assert task_2 == task


def test_serde_view_as_json() -> None:
    tz = datetime.timezone(datetime.timedelta(seconds=3600))

    view = model.View(
        id="dohxduozbs",
        title="view title",
        created=datetime.datetime(2023, 6, 2, 7, 37, 39, tzinfo=tz),
        updated=datetime.datetime(2023, 6, 2, 7, 37, 41, tzinfo=tz),
        tags=frozenset({"tag1"}),
        task_ids=["id1", "id2"],
    )

    raw = view_to_json(view=view)
    assert raw == {
        "id": "dohxduozbs",
        "title": "view title",
        "created": "2023-06-02T07:37:39+01:00",
        "updated": "2023-06-02T07:37:41+01:00",
        "tags": ["tag1"],
        "task_ids": ["id1", "id2"],
    }

    view_2 = json_to_view(raw=raw)

    assert view_2 == view
