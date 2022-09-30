#!/usr/bin/env bash

# This is temporary workaround until you manage the DynamoDB table schema and its
# migrations with Terraform



build_dir="./webapp/compiledDbMigrationScripts"

# Compile TypeScript webapp code to JavaScript
./webapp/node_modules/.bin/tsc \
    ./webapp/src/services/persistence/migrate.ts \
    --outDir $build_dir \
    || echo "error found"

# Execute
node ./webapp/compiledDbMigrationScripts/services/persistence/migrate.js \
    || echo "Migration script has errored"

# Clean up build directory
rm -rf $build_dir
