from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, TypeAlias

import apischema
import requests
from src import model
from src.config import Config

logger = logging.getLogger(__name__)

JsonDict: TypeAlias = dict[str, Any]


@dataclass(frozen=True)
class GetAllResponse:
    tasks: list[model.Task]
    views: list[model.View]

    @classmethod
    def from_json(cls, raw: JsonDict) -> GetAllResponse:
        return apischema.deserialize(GetAllResponse, raw)


def get_all(config: Config) -> GetAllResponse:
    response = requests.get(url=f"{config.api_url}/get-all")
    response.raise_for_status()
    raw_data = response.json()
    data = GetAllResponse.from_json(raw_data)
    return data


def update_task(task: model.Task, config: Config) -> None:
    response = requests.put(
        url=f"{config.api_url}/task",
        json={"task": apischema.serialize(model.Task, task)},
    )
    response.raise_for_status()


def update_view(view: model.View, config: Config):
    response = requests.put(
        url=f"{config.api_url}/view",
        json={"view": apischema.serialize(model.View, view)},
    )
    response.raise_for_status()
