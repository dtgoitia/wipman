from src.adapter.sqlite import DbClient
from src.config import Config


def set_up_minimum_db(config: Config) -> None:
    db = DbClient(config=config)
    db.create_tables_if_missing()
