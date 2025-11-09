#!/bin/sh

# Deploy Sprint100 backend to Railway

set -euo pipefail

railway up --service sprint100-backend --root server

if [ -z "${DATABASE_URL:-}" ] || [ -z "${JWT_SECRET:-}" ]; then
  echo "Error: DATABASE_URL and JWT_SECRET environment variables must be set locally before syncing to Railway." >&2
  exit 1
fi

railway variables set DATABASE_URL="$DATABASE_URL" JWT_SECRET="$JWT_SECRET"

