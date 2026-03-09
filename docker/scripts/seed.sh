#!/usr/bin/env bash
# Run database seed scripts.
# Usage: ./seed.sh [--clean]
#   --clean: run cleanup before seeding (resets all data)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

COMPOSE="docker compose -f $DOCKER_DIR/docker-compose.yml -f $DOCKER_DIR/docker-compose.dev.yml"
EXEC="$COMPOSE exec -e NODE_PATH=/app/node_modules backend"

for arg in "$@"; do
  case "$arg" in
    --clean)
      echo "Cleaning database..."
      $EXEC ./node_modules/.bin/ts-node -T -P /docker/seed/tsconfig.seed.json /docker/seed/cleanup.ts
      ;;
  esac
done

echo "Seeding database..."
$EXEC ./node_modules/.bin/ts-node -T -P /docker/seed/tsconfig.seed.json /docker/seed/seed-all.ts
