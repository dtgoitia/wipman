import os
from dataclasses import dataclass, replace
from functools import lru_cache
from pathlib import Path
from typing import Any, Self


@dataclass(frozen=True)
class Config:
    wipman_dir: Path
    db_path: Path

    def extend(self: Self, **changes: dict[str, Any]) -> Self:
        return replace(self, **changes)


def _path_from_env(envvar: str) -> Path:
    return Path(os.environ[envvar]).expanduser()


def _optional_path_from_env(envvar: str) -> Path | None:
    try:
        return _path_from_env(envvar=envvar)
    except KeyError:
        return None


@lru_cache
def get_config() -> Config:
    return Config(
        wipman_dir=_optional_path_from_env("WIPMAN_DIR"),
        db_path=_optional_path_from_env("DB_PATH"),
    )
