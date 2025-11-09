#!/usr/bin/env bash
set -euo pipefail

compose_file="docker-compose.test.yml"

cleanup() {
  docker compose -f "$compose_file" down -v >/dev/null 2>&1 || true;
}

trap cleanup EXIT

echo "Starting test database..."
docker compose -f "$compose_file" up -d

echo "Applying Prisma migrations..."
npx dotenv -e .env.test -- npm --prefix server run db:migrate:deploy

echo "Running integration tests with coverage..."
npx dotenv -e .env.test -- npm --prefix server run test -- --coverage --coverageReporters=text-summary --coverageReporters=lcov
