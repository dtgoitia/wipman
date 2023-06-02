import dataclasses
from pathlib import Path
from typing import TypeAlias

from asyncinotify import Mask
from src.types import Event

Relevance: TypeAlias = int

# 0 is lowest the lowest relevance
CHANGES_GROUPED_BY_RELEVANCE: dict[Relevance, set[Mask]] = {
    0: {
        Mask.IGNORED,
        Mask.ACCESS,
        Mask.CLOSE_NOWRITE,
    },
    1: {
        Mask.ATTRIB,
        Mask.CLOSE_WRITE,
    },
    2: {
        Mask.DELETE_SELF,
    },
    3: {
        Mask.CREATE,
        Mask.MODIFY,
        Mask.DELETE,
    },
}

# Pre-compute relevances on module load
RELEVANCE_PER_CHANGE: dict[Mask, Relevance] = dict()
for relevance, group in CHANGES_GROUPED_BY_RELEVANCE.items():
    for mask in group:
        RELEVANCE_PER_CHANGE[mask] = relevance
        RELEVANCE_PER_CHANGE[mask | Mask.ISDIR] = relevance


def _get_event_relevance(event: Event) -> Relevance:
    return RELEVANCE_PER_CHANGE[event.mask]


def _merge_delete_events(event: Event) -> Event:
    if event.mask == Mask.DELETE_SELF:
        return dataclasses.replace(event, mask=Mask.DELETE)

    return event


def keep_most_relevants(events: list[Event]) -> list[Event]:
    """
    Return the most relevant occurence per path.

    Per path, this function considers the chronological order of the
    events and their relative relevance.

    Relevance:

    """
    to_keep: dict[Path, Event] = {}

    def _should_keep_first(first: Event, last: Event) -> bool:
        """
        Given that `first` happened chronologically before `last`,
        return True if `first` should be kept (and `last` discarded), or
        return False otherwise.
        """
        first_relevance = _get_event_relevance(event=first)
        last_relevance = _get_event_relevance(event=last)

        return first_relevance > last_relevance

    for event in events:
        event = _merge_delete_events(event=event)

        if first := to_keep.get(event.path):
            if _should_keep_first(first=first, last=event):
                continue  # do nothing

        to_keep[event.path] = event

    return list(to_keep.values())
