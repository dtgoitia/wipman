#!/bin/bash

# Usage example
# cd projects/wipman/api
# K3S_CLUSTER_URL=88.198.150.140 bash api/bin/db/restore_db_backup_to_server.sh kk.db

set -eu

db_backup_file="$1"
remote_user="epo"

if [[ -z "${K3S_CLUSTER_URL}" ]]; then
    echo "Please set K3S_CLUSTER_URL environment variable"
    exit 1
fi

db_backup_path="$(pwd)/${db_backup_file}"

# Push file to server
source="${db_backup_path}"
destiny="${remote_user}@${K3S_CLUSTER_URL}:/home/${remote_user}/k3s-data/wipman-api-db.sqlite"
echo "Sending file over SSH:"
echo "  from: ${source}"
echo "  to:   ${destiny}"
echo ""
scp "${source}" "${destiny}"
