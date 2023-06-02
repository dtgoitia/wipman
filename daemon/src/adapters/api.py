from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, TypeAlias

import apischema
import requests
from src import model
from src.config import Config
from src.devex import todo

logger = logging.getLogger(__name__)

JsonDict: TypeAlias = dict[str, Any]


@dataclass(frozen=True)
class GetAllResponse:
    tasks: list[model.Task]
    views: list[model.View]

    @classmethod
    def from_json(cls, raw: JsonDict) -> GetAllResponse:
        data = apischema.deserialize(GetAllResponse, raw)
        return data


def get_all(config: Config) -> GetAllResponse:
    response = requests.get(url=f"{config.api_url}/get-all")
    response.raise_for_status()
    raw_data = response.json()
    data = GetAllResponse.from_json(raw_data)
    return data
