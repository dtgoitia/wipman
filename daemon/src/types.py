from dataclasses import dataclass
from pathlib import Path
from typing import TypeAlias

from asyncinotify import Event as InotifyEvent
from asyncinotify import Mask

Timestamp: TypeAlias = float
TimedEvent: TypeAlias = tuple[Timestamp, InotifyEvent]
Seconds: TypeAlias = float


@dataclass(frozen=True)
class Event:
    t: float  # timestamp
    mask: Mask
    path: Path
