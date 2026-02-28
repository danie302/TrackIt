#!/usr/bin/env bash
# View TrackIt Docker container logs.
# Usage: ./logs.sh [env] [service] [--no-follow] [--tail N]
#   env:         dev (default), prod, test
#   service:     optional specific service
#   --no-follow: don't follow output (default: follows)
#   --tail N:    number of lines from end (default: 100)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

ENV="${1:-dev}"
shift 2>/dev/null || true

FOLLOW="-f"
TAIL="100"
SERVICE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-follow) FOLLOW="" ;;
    --tail)      TAIL="$2"; shift ;;
    *)           SERVICE="$1" ;;
  esac
  shift
done

docker compose \
  -f "$DOCKER_DIR/docker-compose.yml" \
  -f "$DOCKER_DIR/docker-compose.$ENV.yml" \
  logs --tail="$TAIL" $FOLLOW $SERVICE
