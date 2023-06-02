import os
from dataclasses import dataclass, replace
from functools import lru_cache
from pathlib import Path
from typing import Any, Self


@dataclass(frozen=True)
class Config:
    wipman_dir: Path
    api_url: str

    def extend(self: Self, **changes: dict[str, Any]) -> Self:
        return replace(self, **changes)


def _path_from_env(envvar: str) -> Path:
    return Path(os.environ[envvar]).expanduser()


@lru_cache
def get_config() -> Config:
    if api_url := os.environ.get("API_URL"):
        api_url = api_url.rstrip("/")

    return Config(
        wipman_dir=_path_from_env("WIPMAN_DIR"),
        api_url=api_url,
    )
