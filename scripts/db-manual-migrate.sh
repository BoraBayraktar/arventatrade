#!/usr/bin/env bash

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Kullanim: scripts/db-manual-migrate.sh <migration-name>"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL tanimli degil. Once .env yukleyin."
  exit 1
fi

MIGRATION_NAME="$1"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
MIGRATION_DIR="prisma/migrations/${TIMESTAMP}_${MIGRATION_NAME}"
MIGRATION_FILE="${MIGRATION_DIR}/migration.sql"

mkdir -p "${MIGRATION_DIR}"

echo "SQL diff uretiliyor: ${MIGRATION_FILE}"
npx prisma migrate diff \
  --from-url "${DATABASE_URL}" \
  --to-schema-datamodel prisma/schema.prisma \
  --script \
  --output "${MIGRATION_FILE}"

if [ ! -s "${MIGRATION_FILE}" ]; then
  echo "Bos migration olustu. Dosya temizleniyor."
  rmdir "${MIGRATION_DIR}" 2>/dev/null || true
  exit 0
fi

echo "Migration veritabanina uygulanıyor"
npx prisma db execute --file "${MIGRATION_FILE}" --schema prisma/schema.prisma

MIGRATION_ID="$(basename "${MIGRATION_DIR}")"
echo "Migration applied olarak isaretleniyor: ${MIGRATION_ID}"
npx prisma migrate resolve --applied "${MIGRATION_ID}"

echo "Prisma client guncelleniyor"
npx prisma generate

echo "Tamamlandi: ${MIGRATION_ID}"
