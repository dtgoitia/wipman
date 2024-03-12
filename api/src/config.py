import logging
import os
from dataclasses import dataclass, replace
from functools import lru_cache
from pathlib import Path
from typing import Any, Self

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Config:
    wipman_dir: Path | None
    db_path: Path | None
    api_token: str | None

    def extend(self: Self, **changes: dict[str, Any]) -> Self:
        return replace(self, **changes)


def _path_from_env(envvar: str) -> Path:
    return Path(os.environ[envvar]).expanduser()


def _optional_path_from_env(envvar: str) -> Path | None:
    try:
        return _path_from_env(envvar=envvar)
    except KeyError:
        logger.info(f"environment variable {envvar} is not set")
        return None


def _optional_str_from_env(envvar: str) -> Path | None:
    if value := os.environ.get(envvar):
        return value
    else:
        logger.info(f"environment variable {envvar} is not set")
        return None


@lru_cache
def get_config() -> Config:
    return Config(
        wipman_dir=_optional_path_from_env("WIPMAN_DIR"),
        db_path=_optional_path_from_env("DB_PATH"),
        api_token=_optional_str_from_env("API_TOKEN"),
    )
