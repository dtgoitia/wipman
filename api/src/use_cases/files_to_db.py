from src.adapter.fs import load_wipman_dir
from src.adapter.sqlite import DbClient
from src.config import Config


def dump_wipman_dir_to_db(config: Config) -> None:
    views, tasks = load_wipman_dir(config=config)

    db = DbClient(config=config)
    db.dump_wipman(views=views, tasks=tasks)
