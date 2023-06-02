import argparse
import logging
from pathlib import Path

from src.config import get_config

from daemon.src.use_cases.restore_wipman_dir_from_api import restore_wipman_dir_from_api

logger = logging.getLogger(__name__)


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--wipman-dir",
        help="Overwrites the WIPMAN_DIR environment variable",
    )
    parser.add_argument(
        "--api-url",
        help="Overwrites the API_URL environment variable",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Show debug logs")
    args = parser.parse_args()
    return args


def restore_wipman_dir_from_api_cmd(
    wipman_dir: str | None = None, api_url: str | None = None
) -> None:
    config = get_config()
    if wipman_dir:
        config = config.extend(wipman_dir=Path(wipman_dir))
    if api_url:
        config = config.extend(api_url=api_url)

    restore_wipman_dir_from_api(config=config)


if __name__ == "__main__":
    arguments = parse_arguments()

    log_level = logging.DEBUG if arguments.verbose else logging.INFO
    logging.basicConfig(level=log_level, format="%(message)s")
    logger.debug("Verbose mode: ON")

    restore_wipman_dir_from_api_cmd(
        wipman_dir=arguments.wipman_dir, api_url=arguments.api_url
    )
