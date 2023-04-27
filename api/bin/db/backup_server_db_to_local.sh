#!/bin/bash

# Usage example
# cd projects/wipman/api
# API_BASE_URL=88.198.150.140 bash api/bin/db/backup_server_db_to_local.sh kk.db

set -eu

# Default values
remote_user="epo"


timestamp="$( \
    date --iso-8601=seconds --utc \
    | cut -d "+" -f 1 \
    | tr -d "-" \
    | tr -d ":" \
    | tr "T" "-" \
)"
default_backup_filename="${timestamp}-wipman-backup.db"

# If not name provided via CLI arg, use default
db_backup_file="${1:-"${default_backup_filename}"}"

set +u
if [[ -z "${API_BASE_URL}" ]]; then
    echo "Please set API_BASE_URL environment variable"
    exit 1
fi
set -u

db_backup_path="$(pwd)/${db_backup_file}"

# Push file to server
source="${remote_user}@${API_BASE_URL}:/home/${remote_user}/projects/wipman/api/wipman.db"
destiny="${db_backup_path}"
echo "Sending file over SSH:"
echo "  from: ${source}"
echo "  to:   ${destiny}"
echo ""
scp "${source}" "${destiny}"
