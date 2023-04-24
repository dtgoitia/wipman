#!/bin/bash

# Usage example
# cd projects/wipman/api
# API_BASE_URL=88.198.150.140 bash api/bin/db/restore_db_backup_to_server.sh kk.db

set -eu

db_backup_file="$1"
remote_user="epo"

if [[ -z "${API_BASE_URL}" ]]; then
    echo "Please set API_BASE_URL environment variable"
    exit 1
fi

db_backup_path="$(pwd)/${db_backup_file}"

# Push file to server
source="${db_backup_path}"
destiny="${remote_user}@${API_BASE_URL}:/home/${remote_user}/projects/wipman/api/wipman.db"
echo "Sending file over SSH:"
echo "  from: ${source}"
echo "  to:   ${destiny}"
echo ""
scp "${source}" "${destiny}"
