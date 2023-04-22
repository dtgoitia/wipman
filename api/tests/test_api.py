import datetime

import pytest
from flask import Flask
from flask.testing import FlaskClient

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
