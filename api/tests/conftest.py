from pathlib import Path

import pytest
from src.config import Config


@pytest.fixture
def test_config() -> Config:
    return Config(
        wipman_dir=Path("tests/test_wipman_dir"),
        db_path=Path("tests/test_db.db"),
    )
