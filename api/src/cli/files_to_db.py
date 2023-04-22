import argparse
import logging
from pathlib import Path

from src.config import get_config
from src.use_cases.files_to_db import dump_wipman_dir_to_db

logger = logging.getLogger(__name__)


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--wipman-dir",
        help="Overwrites the WIPMAN_DIR environment variable",
    )
    parser.add_argument(
        "--db-path",
        help="Overwrites the DB_PATH environment variable",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Show debug logs")
    args = parser.parse_args()
    return args


def files_to_db_cmd(wipman_dir: str | None = None, db_path: str | None = None) -> None:
    config = get_config()
    if wipman_dir:
        config = config.extend(wipman_dir=Path(wipman_dir))
    if db_path:
        config = config.extend(db_path=Path(db_path))

    dump_wipman_dir_to_db(config=config)


if __name__ == "__main__":
    arguments = parse_arguments()

    log_level = logging.DEBUG if arguments.verbose else logging.INFO
    logging.basicConfig(level=log_level, format="%(message)s")
    logger.debug("Verbose mode: ON")

    files_to_db_cmd(wipman_dir=arguments.wipman_dir, db_path=arguments.db_path)
