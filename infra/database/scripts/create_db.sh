#!/usr/bin/env bash
set -euo pipefail

# The official entrypoint exports POSTGRES_DB / POSTGRES_PASSWORD/ POSTGRES_USER for us.
: "${POSTGRES_DB:?Need POSTGRES_DB}"
: "${POSTGRES_PASSWORD:?Need POSTGRES_PASSWORD}"
: "${POSTGRES_USER:?Need POSTGRES_USER}"

DB_NAME="$POSTGRES_DB"
DB_OWNER="$POSTGRES_USER"

export PGPASSWORD="$POSTGRES_PASSWORD"

echo "🔄  Ensuring database \"$DB_NAME\" exists…"

psql -v ON_ERROR_STOP=1 -U "$DB_OWNER" -d postgres <<-EOSQL
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
      CREATE DATABASE "${DB_NAME}" OWNER "${DB_OWNER}";
    END IF;
  END
  \$\$;
EOSQL

echo "✅  \"$DB_NAME\" is ready."
