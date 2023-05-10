import datetime
import logging

from flask import Flask, request
from flask_cors import CORS
from src.adapter.json import json_to_task, json_to_view, task_to_json, view_to_json
from src.config import get_config
from src.model import TaskId, ViewId
from src.use_cases.health import service_is_healthy
from src.use_cases.read_from_db import read_tasks_updated_after, read_view_updated_after
from src.use_cases.set_up_minimum_db import set_up_minimum_db
from src.use_cases.update_items import (
    create_task,
    create_view,
    delete_task,
    delete_view,
    update_task,
    update_view,
)

logger = logging.getLogger(__name__)

config = get_config()

app = Flask(__name__)

# TODO; narrow down CORS allowed domain
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    # Ideas: https://stackoverflow.com/questions/25389261/which-http-status-code-should-i-use-for-a-health-check-failure

    in_debug_mode = True  # TODO: get this from...where? see WIP - take if from config

    is_healthy, reason = service_is_healthy(config=config)

    status = 200 if is_healthy else 503
    payload = {"isHealthy": is_healthy}
    if in_debug_mode and not is_healthy:
        payload.update({"reason": reason or "unknown"})

    return payload, status


@app.route("/get-all", methods=["GET"])
def get_all():
    t = datetime.datetime.min

    tasks = read_tasks_updated_after(t=t, config=config)
    views = read_view_updated_after(t=t, config=config)

    # TODO: use marshmallow to serialize/deserialize/validate
    json_tasks = list(map(task_to_json, tasks))
    json_views = list(map(view_to_json, views))

    return {"tasks": json_tasks, "views": json_views}


@app.route("/changes", methods=["GET"])
def changes_after_date():
    # TODO: add marshmallow to serialize/deserialize/validate
    t = datetime.datetime.fromisoformat(request.json["after"])

    tasks = read_tasks_updated_after(t=t, config=config)
    views = read_view_updated_after(t=t, config=config)

    # TODO: use marshmallow to serialize/deserialize/validate
    json_tasks = list(map(task_to_json, tasks))
    json_views = list(map(view_to_json, views))

    return {"tasks": json_tasks, "views": json_views}


@app.route("/task", methods=["POST"])
def create_task_route():
    # TODO: use marshmallow to serialize/deserialize/validate
    task = json_to_task(request.json["task"])

    created = create_task(task=task, config=config)

    # TODO: use marshmallow to serialize/deserialize/validate
    return {"created_task": task_to_json(task=created)}


@app.route("/view", methods=["POST"])
def create_view_route():
    # TODO: use marshmallow to serialize/deserialize/validate
    view = json_to_view(request.json["view"])

    created = create_view(view=view, config=config)

    # TODO: use marshmallow to serialize/deserialize/validate
    return {"created_view": view_to_json(view=created)}


@app.route("/task", methods=["PUT"])
def update_task_route():
    # TODO: use marshmallow to serialize/deserialize/validate
    task = json_to_task(request.json["task"])

    updated = update_task(task=task, config=config)

    # TODO: use marshmallow to serialize/deserialize/validate
    return {"updated_task": task_to_json(task=updated)}


@app.route("/view", methods=["PUT"])
def update_view_route():
    # TODO: use marshmallow to serialize/deserialize/validate
    view = json_to_view(request.json["view"])

    updated = update_view(view=view, config=config)

    # TODO: use marshmallow to serialize/deserialize/validate
    return {"updated_view": view_to_json(view=updated)}


@app.route("/task/<task_id>", methods=["DELETE"])
def delete_task_route(task_id: TaskId):
    # TODO: use marshmallow to serialize/deserialize/validate
    deleted_id = delete_task(task_id=task_id, config=config)

    # TODO: use marshmallow to serialize/deserialize/validate
    return {"deleted_task_id": deleted_id}


@app.route("/view/<view_id>", methods=["DELETE"])
def delete_view_route(view_id: ViewId):
    # TODO: use marshmallow to serialize/deserialize/validate
    deleted_id = delete_view(view_id=view_id, config=config)

    # TODO: use marshmallow to serialize/deserialize/validate
    return {"deleted_view_id": deleted_id}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    logger.info(f"config: {config}")

    if not config.db_path.exists():
        exit(
            f"Expected to find DB file at {config.db_path.absolute()} but"
            " it does not exist. Aborting..."
        )

    set_up_minimum_db(config=config)

    # By default, flask serves in `localhost`, which makes the webserver
    # inaccessible once you containerize it.
    host = "0.0.0.0"

    app.run(host=host, port=5000, debug=True)

"""
# On start:
scan all files
scan sqlite DB
assert all aligned


# Task file updated in laptop
{"event": "transaction-started", "payload": {"transaction_id": "123abc"} }
{"event": "file-updated",        "payload": {"path": "foo/bar"} }
add change to queue
{"event": "file-updated",        "payload": {"path": "foo/bar2"} }
add change to queue
{"event": "transaction-ended", "payload": {"transaction_id": "123abc"} }
gather all changes from filesystem
    read files
    single push to sqlite file with `updated_at` = transaction ?start/end? time

when UI queries endpoint --- you can make it push later via webhook, etc.
    read from sqlite
"""
