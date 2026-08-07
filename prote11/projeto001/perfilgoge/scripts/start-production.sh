#!/bin/sh
set -eu

SCHEMA_PATH="prisma/schema.prisma"
MIGRATION_LOG="/tmp/perfilpro-prisma-migrate.log"

run_migrations() {
  npx prisma migrate deploy --schema="$SCHEMA_PATH"
}

if ! run_migrations >"$MIGRATION_LOG" 2>&1; then
  cat "$MIGRATION_LOG"

  if grep -q "Error: P3005" "$MIGRATION_LOG"; then
    if [ ! -d "prisma/migrations/init" ]; then
      echo "Prisma P3005 detectado, mas a migração inicial 'init' não existe no deploy." >&2
      exit 1
    fi

    echo "Prisma P3005 detectado: registrando a migração inicial existente como aplicada, sem resetar o banco."
    npx prisma migrate resolve --applied init --schema="$SCHEMA_PATH"
    run_migrations
  else
    echo "Falha nas migrações Prisma; baseline automático não foi aplicado." >&2
    exit 1
  fi
else
  cat "$MIGRATION_LOG"
fi

exec npx tsx src/server/index.ts
