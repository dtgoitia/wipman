#!/usr/bin/env python3

import argparse
import subprocess
import sys
from pathlib import Path
from typing import TypeAlias

GitRef: TypeAlias = str


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--last-ref", required=True, help="git ref to compare")
    parser.add_argument("--current-ref", required=True, help="git ref to compare")
    args = parser.parse_args()
    return args


def git_diff(a: GitRef, b: GitRef) -> list[Path]:
    cmd = ["git", "diff", "--name-only", f"{a}", f"{b}"]

    proc = subprocess.run(cmd, capture_output=True)
    stdout = proc.stdout.decode("utf-8")
    stderr = proc.stderr.decode("utf-8")
    if stderr:
        print(stderr, file=sys.stderr)
        exit(1)

    lines = (line for line in stdout.strip().split("\n"))
    paths = [Path(line) for line in lines if line]
    return paths


def get_changed_directories(a: GitRef, b: GitRef) -> None:
    changed_paths = git_diff(a=a, b=b)
    topmost_paths = {Path(path.parts[0]) for path in changed_paths}
    dirs = [path for path in topmost_paths if path.is_dir()]

    for dir_name in sorted(dirs):
        print(dir_name)


if __name__ == "__main__":
    arguments = parse_arguments()

    get_changed_directories(a=arguments.last_ref, b=arguments.current_ref)
