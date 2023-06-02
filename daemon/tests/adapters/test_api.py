import datetime

from src import model
from src.adapters.api import GetAllResponse


def test_serde_get_all():
    raw = {
        "tasks": [
            {
                "id": "task id",
                "title": "task title",
                "created": "2023-06-02T07:37:39+01:00",
                "updated": "2023-06-02T07:37:41+01:00",
                "tags": ["tag1", "tag2"],
                "blocked_by": [],
                "blocks": [],
                "completed": False,
                "content": "task content",
            },
        ],
        "views": [
            {
                "id": "view id",
                "title": "view title",
                "created": "2023-06-02T07:37:39+01:00",
                "updated": "2023-06-02T07:37:41+01:00",
                "tags": ["tag1"],
                "task_ids": ["task_id_1", "task_id_2"],
            },
        ],
    }

    data = GetAllResponse.from_json(raw)

    assert data == GetAllResponse(
        tasks=[
            model.Task(
                id="task id",
                title="task title",
                created=datetime.datetime(
                    2023,
                    6,
                    2,
                    7,
                    37,
                    39,
                    tzinfo=datetime.timezone(datetime.timedelta(seconds=3600)),
                ),
                updated=datetime.datetime(
                    2023,
                    6,
                    2,
                    7,
                    37,
                    41,
                    tzinfo=datetime.timezone(datetime.timedelta(seconds=3600)),
                ),
                tags=frozenset({"tag1", "tag2"}),
                blocked_by=frozenset(),
                blocks=frozenset(),
                completed=False,
                content="task content",
            )
        ],
        views=[
            model.View(
                id="view id",
                title="view title",
                created=datetime.datetime(
                    2023,
                    6,
                    2,
                    7,
                    37,
                    39,
                    tzinfo=datetime.timezone(datetime.timedelta(seconds=3600)),
                ),
                updated=datetime.datetime(
                    2023,
                    6,
                    2,
                    7,
                    37,
                    41,
                    tzinfo=datetime.timezone(datetime.timedelta(seconds=3600)),
                ),
                tags=frozenset({"tag1"}),
                task_ids=["task_id_1", "task_id_2"],
            )
        ],
    )
