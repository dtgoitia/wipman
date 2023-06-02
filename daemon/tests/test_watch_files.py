from pathlib import Path

from asyncinotify import Mask
from src.daemon import Event as E
from src.daemon import keep_most_relevants


def test_keep_last():
    # events pulled from actually watching interactions in runtime
    events = [
        E(t=1300, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa")),
        E(t=1850, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa")),
        E(t=2297, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa")),
        E(t=2795, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa")),
        E(t=4114, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa/bb")),
        E(t=4620, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa/bb")),
        E(t=5077, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa/bb")),
        E(t=5578, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa/bb")),
        E(t=7070, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa/bb/cc")),
        E(t=7676, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa/bb/cc")),
        E(t=8033, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa/bb/cc")),
        E(t=8548, mask=Mask.ACCESS | Mask.ISDIR, path=Path("/aa/bb/cc")),
        E(t=8970, mask=Mask.DELETE, path=Path("/aa/bb/cc/kk.md")),
        E(t=12032, mask=Mask.CLOSE_NOWRITE | Mask.ISDIR, path=Path("/aa/bb/cc")),
        E(t=12394, mask=Mask.CLOSE_NOWRITE | Mask.ISDIR, path=Path("/aa/bb/cc")),
        E(t=12690, mask=Mask.DELETE_SELF, path=Path("/aa/bb/cc")),
        E(t=12910, mask=Mask.IGNORED, path=Path("/aa/bb/cc")),
        E(t=13093, mask=Mask.DELETE | Mask.ISDIR, path=Path("/aa/bb/cc")),
        E(t=13367, mask=Mask.CLOSE_NOWRITE | Mask.ISDIR, path=Path("/aa/bb")),
        E(t=13670, mask=Mask.CLOSE_NOWRITE | Mask.ISDIR, path=Path("/aa/bb")),
        E(t=13891, mask=Mask.DELETE_SELF, path=Path("/aa/bb")),
        E(t=14101, mask=Mask.IGNORED, path=Path("/aa/bb")),
        E(t=14356, mask=Mask.DELETE | Mask.ISDIR, path=Path("/aa/bb")),
        E(t=14688, mask=Mask.CLOSE_NOWRITE | Mask.ISDIR, path=Path("/aa")),
        E(t=14993, mask=Mask.CLOSE_NOWRITE | Mask.ISDIR, path=Path("/aa")),
        E(t=15203, mask=Mask.DELETE_SELF, path=Path("/aa")),
        E(t=15460, mask=Mask.IGNORED, path=Path("/aa")),
        E(t=15730, mask=Mask.DELETE | Mask.ISDIR, path=Path("/aa")),
    ]

    result = set(keep_most_relevants(events=events))
    # print()
    # print()
    # for e in sorted(result, key=lambda e: e.path):
    #     print(f"{e.mask.name:<15}  {e.path}")
    # print()
    assert result == {
        E(t=15730, mask=Mask.DELETE | Mask.ISDIR, path=Path("/aa")),
        E(t=14356, mask=Mask.DELETE | Mask.ISDIR, path=Path("/aa/bb")),
        E(t=13093, mask=Mask.DELETE | Mask.ISDIR, path=Path("/aa/bb/cc")),
        E(t=8970, mask=Mask.DELETE, path=Path("/aa/bb/cc/kk.md")),
    }


def test_keep_only_the_most_relevant_last_event():
    # Given some user actions
    sequence = [
        Mask.CREATE,
        Mask.ACCESS,
        Mask.MODIFY,
        Mask.DELETE,
        Mask.CREATE,
        Mask.DELETE,
    ]

    # and all actions happen in the same file
    path = Path("/aa")

    # then inofity produces a sequence of events
    all_events = [
        E(t=i, mask=mask, path=path) for i, mask in enumerate(sequence, start=1)
    ]

    #
    # Assert what would the output would be at each point in the sequence
    #

    # Only first event
    events = all_events[0:1]
    event = next(iter(keep_most_relevants(events=events)))
    assert event.mask == Mask.CREATE

    # First 2 events
    events = all_events[0:2]
    event = next(iter(keep_most_relevants(events=events)))
    assert event.mask == Mask.CREATE  # ACCESS should be ignored

    # First 3 events
    events = all_events[0:3]
    event = next(iter(keep_most_relevants(events=events)))
    assert event.mask == Mask.MODIFY

    # First 4 events
    events = all_events[0:4]
    event = next(iter(keep_most_relevants(events=events)))
    assert event.mask == Mask.DELETE

    # First 5 events
    events = all_events[0:5]
    event = next(iter(keep_most_relevants(events=events)))
    assert event.mask == Mask.CREATE

    # All event
    events = all_events
    event = next(iter(keep_most_relevants(events=events)))
    assert event.mask == Mask.DELETE
