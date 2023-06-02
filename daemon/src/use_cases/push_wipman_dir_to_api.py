import logging
from pathlib import Path

from src.adapters import api, fs
from src.config import Config
from src.model import Task, TaskId, View

logger = logging.getLogger(__name__)


def push_wipman_dir_to_api(config: Config) -> None:
    logger.info("Loading data from wipman directory")
    views, tasks = fs.load_wipman_dir(config=config)

    logger.info("Pushing data to API")
    for task_counter, task in enumerate(tasks):
        api.update_task(task=task, config=config)
    logger.info(f"{task_counter + 1} Tasks pushed to API")

    for view_counter, view in enumerate(views):
        api.update_view(view=view, config=config)
    logger.info(f"{view_counter + 1} Views pushed to API")
