from typing import TypeAlias

from src.adapter.sqlite import DbClient
from src.config import Config

IsHealthy: TypeAlias = bool
Reason: TypeAlias = str | None


def service_is_healthy(config: Config) -> tuple[IsHealthy, Reason]:
    is_healthy: IsHealthy = False
    reason: Reason = None

    try:
        db = DbClient(config=config)
        is_healthy = db.is_healthy()
        if not is_healthy:
            reason = "DB health check returned an unexpected result"
    except Exception as error:
        reason = repr(error)

    return is_healthy, reason
