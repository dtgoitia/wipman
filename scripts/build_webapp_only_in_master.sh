#!/usr/bin/env bash

echo -n "Checking branch..."
current_branch=$(git branch --show-current)
echo " current branch: $current_branch"

if [ "${current_branch}" != "master" ]; then
    echo "Aborting build as you are not in 'master' branch"
    exit 0
fi

echo "Cool, you are in 'master' branch, let's build the webapp"

scripts/build_webapp.sh
