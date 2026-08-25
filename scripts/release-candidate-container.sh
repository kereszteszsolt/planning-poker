#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
playwright_image="mcr.microsoft.com/playwright:v1.62.1-noble"

docker run --rm --init \
  -e CI=1 \
  -e TZ=UTC \
  -e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
  -e TURBO_TELEMETRY_DISABLED=1 \
  -v "${repository_root}:/source:ro" \
  -w /work \
  "${playwright_image}" \
  sh -lc '
    set -eu
    mkdir -p /work
    tar -C /source \
      --exclude=.git \
      --exclude=node_modules \
      --exclude="*/node_modules" \
      --exclude=apps/server/dist \
      --exclude=apps/web/dist \
      --exclude=packages/contracts/dist \
      --exclude=.turbo \
      --exclude="*/.turbo" \
      --exclude=.pnpm-store \
      --exclude="*/.pnpm-store" \
      --exclude=apps/server/.env \
      --exclude=apps/web/.env \
      --exclude=test-results \
      --exclude="*/test-results" \
      --exclude=e2e-results \
      --exclude="*/e2e-results" \
      --exclude=playwright-report \
      --exclude="*/playwright-report" \
      --exclude=e2e-report \
      --exclude="*/e2e-report" \
      -cf - . | tar -C /work -xf -
    corepack enable
    corepack prepare pnpm@11.23.0 --activate
    pnpm install --frozen-lockfile

    echo "PP-010 release candidate pass 1/2: forced clean task execution"
    pnpm verify:repo
    pnpm turbo run lint typecheck test build --force
    pnpm e2e
    pnpm screenshots

    echo "PP-010 release candidate pass 2/2: normal cache behavior"
    pnpm verify
  '
