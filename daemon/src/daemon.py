from __future__ import annotations

import asyncio
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator

from asyncinotify import Event as InotifyEvent
from asyncinotify import Inotify, Mask
from src.types import Event, Seconds
from src.watch_files import keep_most_relevants

SECONDS_BEFORE_CHECKING: Seconds = 0.2

# amount of time during which no files must change to stop accummulating file changes
QUIET_SECONDS: Seconds = 1


EVENTS_OF_INTEREST = (
    Mask.MODIFY
    | Mask.ATTRIB
    | Mask.MOVE
    | Mask.CREATE
    | Mask.DELETE
    | Mask.DELETE_SELF
    | Mask.MOVE_SELF
)


@dataclass
class Store:
    group: list[Event]
    target_t: Seconds | None

    def pop_group(self) -> list[Event]:
        group = self.group
        self.group, self.target_t = [], None
        return group


def inotify_to_event(ie: InotifyEvent) -> Event:
    return Event(t=time.time(), mask=ie.mask, path=ie.path)


async def emit_when_quiet(store: Store, group_collection_completed: asyncio.Event):
    """
    Decides when to stop collecting inotify events and process them.

    Criteria: when enough time has passed without inotify emitting any event, this
    function emits and buffered inotify events are processed.
    """
    while True:
        now = time.time()
        if store.target_t and store.target_t <= now:
            # enough time without emissions achieved, time to deliver the buffered
            group_collection_completed.set()
        await asyncio.sleep(SECONDS_BEFORE_CHECKING)


async def watch_files(path_store: PathStore, s: Store):
    print("watch_files:starting...")

    with Inotify() as inotify:
        # def _print_watched_paths():
        #     watched_paths = list(sorted(x.path for x in inotify._watches.values()))
        #     print("    watched paths:")
        #     for i, path in enumerate(watched_paths):
        #         print(f"      {str(i):>2} {path}")

        for path in path_store.paths:
            inotify.add_watch(path, EVENTS_OF_INTEREST)

        # Iterate events forever, yielding them one at a time
        async for ievent in inotify:
            event = inotify_to_event(ievent)

            if event.path.name == "wipman":
                continue  # just too noisy!

            events = [event]
            if Mask.CREATE in event.mask and event.path.is_dir():
                for path in event.path.rglob("*"):
                    inotify.add_watch(path, EVENTS_OF_INTEREST)
                    if path.is_dir():
                        mask = Mask.CREATE | Mask.ISDIR
                    else:
                        mask = Mask.CREATE
                    event = Event(t=event.t, path=path, mask=mask)
                    events.append(event)

            for event in events:
                print(f"<--     {event.mask.name:<15} {event.path}")
                s.group.append(event)
                s.target_t = event.t + QUIET_SECONDS


def process_group(events: list[Event]) -> None:
    deduped = keep_most_relevants(events)
    print()
    print(f"processing group:")
    for event in deduped:
        print(f"  >>> {event.mask.name:<15} {event.path}")
    print(f"  -----")
    print()


async def process_groups(group_collection_completed: asyncio.Event, store: Store):
    i = 0
    while True:
        await group_collection_completed.wait()
        group_collection_completed.clear()
        group = store.pop_group()
        # print(i)
        process_group(events=group)
        i += 1


async def amain(path_store: PathStore):
    # Global store to share state across the different async tasks
    store = Store(group=[], target_t=None)

    group_collection_completed = asyncio.Event()

    group_processor = process_groups(
        store=store,
        group_collection_completed=group_collection_completed,
    )
    completion_signaler = emit_when_quiet(
        store=store,
        group_collection_completed=group_collection_completed,
    )
    file_watcher = watch_files(path_store=path_store, s=store)

    asyncio.create_task(completion_signaler)
    asyncio.create_task(group_processor)
    await asyncio.create_task(file_watcher)


class MustBeDirectory(Exception):
    ...


def find_all_paths(dir: Path) -> set[Path]:
    if not dir.exists():
        raise FileNotFoundError()

    if dir.is_file():
        raise MustBeDirectory(f"Path {dir} is a file")

    start = time.time()
    print(f"Scanning {dir} ", end="...")
    paths = set(dir.rglob("*"))
    paths = set(path for path in dir.rglob("*") if path.is_dir())
    paths.add(dir)
    end = time.time()
    print(f"took {(end - start):0.2f}s")
    return paths


# Maybe this class is not necessary if you never raise when a group collection is completed
class PathStore:
    """
    Rationale:
        - asyncinotify fails if you ask to watch a non-existent path
        - re-scanning all files is slow -- you can miss inotify emissions while scanning
          because you are still not listening
        - this class is a cache that tracks paths as they come/go to avoid re-scanning
          and start watching as soon as the batch processing is over <<<<<<<<<<<<<<<<<<<<<<<<<<< is this good enough?
    """

    def __init__(self, root: Path):
        self.root = root
        self.paths = find_all_paths(dir=root)
        # self._print_paths()

    def add(self, path: Path) -> None:
        self.paths.add(path)
        self._print_paths()

    def delete(self, path: Path) -> None:
        self.paths.pop(path)
        self._print_paths()

    def _print_paths(self):
        print()
        print("tracked paths:")
        for i, path in enumerate(sorted(self.paths)):
            print(f"  {str(i):>2}: {path}")
        print()


def main():
    # TODO: move this to a config object
    wipman_dir = Path(os.environ["WIPMAN_DIR"])

    path_store = PathStore(root=wipman_dir)

    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(amain(path_store=path_store))
    except KeyboardInterrupt:
        print("shutting down")
    finally:
        loop.run_until_complete(loop.shutdown_asyncgens())
        loop.close()


if __name__ == "__main__":
    main()
