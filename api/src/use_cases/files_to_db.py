import logging

from src.adapter.fs import load_wipman_dir
from src.adapter.sqlite import DbClient
from src.config import Config

logger = logging.getLogger(__name__)


def dump_wipman_dir_to_db(config: Config) -> None:
    logger.info(f"Reading wipman directory: {config.wipman_dir.absolute()}")
    views, tasks = load_wipman_dir(config=config)

    db = DbClient(config=config)
    db.dump_wipman(views=views, tasks=tasks)
    logger.info(f"Data saved to: {config.db_path.absolute()}")
