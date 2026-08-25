#!/usr/bin/env bash

set -euo pipefail

screenshot_mode="compare"
if [[ "${1:-}" == "--update" ]]; then
  screenshot_mode="update"
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--update]" >&2
  exit 2
fi

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
playwright_image="mcr.microsoft.com/playwright:v1.62.1-noble"

docker run --rm --init \
  -e CI=1 \
  -e TZ=UTC \
  -e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
  -e TURBO_TELEMETRY_DISABLED=1 \
  -e "PP_SCREENSHOT_MODE=${screenshot_mode}" \
  -v "${repository_root}:/source:ro" \
  -v "${repository_root}/docs/screenshots:/output" \
  -w /work \
  "${playwright_image}" \
  sh -lc '
    set -eu
    mkdir -p /work
    tar -C /source \
      --exclude=.git \
      --exclude=node_modules \
      --exclude="*/node_modules" \
      --exclude=dist \
      --exclude="*/dist" \
      --exclude=.turbo \
      --exclude="*/.turbo" \
      --exclude=.pnpm-store \
      --exclude="*/.pnpm-store" \
      --exclude=apps/server/.env \
      --exclude=apps/web/.env \
      --exclude=test-results \
      --exclude="*/test-results" \
      -cf - . | tar -C /work -xf -
    corepack enable
    corepack prepare pnpm@11.23.0 --activate
    pnpm install --frozen-lockfile
    if [ "$PP_SCREENSHOT_MODE" = "update" ]; then
      pnpm screenshots:update
      cp /work/docs/screenshots/planning-poker-home-desktop.png /output/planning-poker-home-desktop.png
      cp /work/docs/screenshots/planning-poker-join-desktop.png /output/planning-poker-join-desktop.png
      cp /work/docs/screenshots/planning-poker-room-voting-desktop.png /output/planning-poker-room-voting-desktop.png
      cp /work/docs/screenshots/planning-poker-room-results-desktop.png /output/planning-poker-room-results-desktop.png
      cp /work/docs/screenshots/planning-poker-room-mobile.png /output/planning-poker-room-mobile.png
      cp /work/docs/screenshots/planning-poker-disconnected-mobile.png /output/planning-poker-disconnected-mobile.png
    else
      pnpm screenshots
    fi
  '
