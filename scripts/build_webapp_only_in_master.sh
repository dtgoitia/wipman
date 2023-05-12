#!/usr/bin/env bash

set -eu

target_branch="master"
target_dir="webapp"

echo -n "Ensuring current branch is '${target_branch}'... "
current_branch=$(git branch --show-current)
echo "done"

if [ "${current_branch}" != "${target_branch}" ]; then
    echo "Stopping build: must be in '${target_branch}' branch to build"
    exit 0
fi

last_ref="origin/master"
current_ref="HEAD"
target_path="$(realpath "${target_dir}")"
echo -n "Looking for code changes in '${target_path}' directory... "

changed_paths="$( \
    git diff --name-only "${last_ref}" "${current_ref}" \
    | grep -v "scripts/" \
    | xargs realpath
)"
webapp_changes="$(echo -n "${changed_paths}" | grep "${target_path}/" || echo "no_changes_found")"
echo "done"

if [ "${webapp_changes}" == "no_changes_found" ]; then
    echo "Stopping build: no changes found in '${target_dir}' directory"
    exit 0
fi

scripts/build_webapp.sh
