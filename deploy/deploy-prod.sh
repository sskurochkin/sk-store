#!/usr/bin/env bash
# Production deploy helper — build/recreate only what changed since last deploy.
# Run from repo root on the server after `git pull`.
#
# Tracks last successful deploy in .deploy-last-commit (server-local, gitignored).

set -euo pipefail

DEPLOY_MARKER="${DEPLOY_MARKER:-.deploy-last-commit}"
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml --env-file .env.production}"

export GIT_COMMIT="${GIT_COMMIT:-$(git rev-parse HEAD)}"
export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"

PREV=""
if [ -f "$DEPLOY_MARKER" ]; then
  PREV="$(tr -d '[:space:]' < "$DEPLOY_MARKER")"
fi

BUILD_FRONTEND=0
BUILD_BACKEND=0
RECREATE_FRONTEND=0
RECREATE_BACKEND=0
RUN_MIGRATE=0

paths_changed() {
  local base="${1:?}"
  shift
  git cat-file -e "${base}^{commit}" 2>/dev/null && ! git diff --quiet "$base" "$GIT_COMMIT" -- "$@"
}

if [ "${FORCE_BUILD:-0}" = "1" ] || [ "${FORCE_BUILD:-}" = "true" ]; then
  echo "==> FORCE_BUILD — rebuild and recreate all app services"
  BUILD_FRONTEND=1
  BUILD_BACKEND=1
  RECREATE_FRONTEND=1
  RECREATE_BACKEND=1
  RUN_MIGRATE=1
elif [ -z "$PREV" ] || ! git cat-file -e "${PREV}^{commit}" 2>/dev/null; then
  echo "==> First deploy or missing deploy marker — build and recreate all app services"
  BUILD_FRONTEND=1
  BUILD_BACKEND=1
  RECREATE_FRONTEND=1
  RECREATE_BACKEND=1
  RUN_MIGRATE=1
else
  if [ "$PREV" = "$GIT_COMMIT" ]; then
    echo "==> Already deployed commit ${GIT_COMMIT} — nothing to do"
    exit 0
  fi

  if paths_changed "$PREV" frontend/; then
    echo "==> Frontend changes detected (${PREV}..${GIT_COMMIT})"
    BUILD_FRONTEND=1
    RECREATE_FRONTEND=1
  else
    echo "==> No frontend changes (${PREV}..${GIT_COMMIT})"
  fi

  if paths_changed "$PREV" server/; then
    echo "==> Backend changes detected (${PREV}..${GIT_COMMIT})"
    BUILD_BACKEND=1
    RECREATE_BACKEND=1
    RUN_MIGRATE=1
  else
    echo "==> No backend changes (${PREV}..${GIT_COMMIT})"
  fi

  if paths_changed "$PREV" docker-compose.prod.yml; then
    echo "==> docker-compose.prod.yml changed — recreate app containers"
    RECREATE_FRONTEND=1
    RECREATE_BACKEND=1
  fi

  if [ "$BUILD_FRONTEND" -eq 0 ] && [ "$BUILD_BACKEND" -eq 0 ] && \
     [ "$RECREATE_FRONTEND" -eq 0 ] && [ "$RECREATE_BACKEND" -eq 0 ]; then
    echo "==> No app or compose changes (${PREV}..${GIT_COMMIT}) — update marker only"
    printf '%s\n' "$GIT_COMMIT" > "$DEPLOY_MARKER"
    exit 0
  fi

  # Image tags include GIT_COMMIT; retag/recreate when commit moved without a rebuild.
  if [ "$PREV" != "$GIT_COMMIT" ]; then
    [ "$BUILD_FRONTEND" -eq 0 ] && RECREATE_FRONTEND=1
    [ "$BUILD_BACKEND" -eq 0 ] && RECREATE_BACKEND=1
  fi
fi

retag_image() {
  local repo="$1"
  if docker image inspect "${repo}:${PREV}" >/dev/null 2>&1; then
    docker tag "${repo}:${PREV}" "${repo}:${GIT_COMMIT}"
    echo "==> Retagged ${repo}:${PREV} → ${repo}:${GIT_COMMIT}"
    return 0
  fi
  echo "==> Image ${repo}:${PREV} not found — will build"
  return 1
}

echo "==> Deploy commit: ${GIT_COMMIT} (previous: ${PREV:-none})"

if [ "$BUILD_BACKEND" -eq 1 ]; then
  echo "==> Build backend"
  $COMPOSE build --progress=plain backend
elif [ -n "$PREV" ] && [ "$PREV" != "$GIT_COMMIT" ]; then
  retag_image sk-store-prod-backend || {
    BUILD_BACKEND=1
    RECREATE_BACKEND=1
    $COMPOSE build --progress=plain backend
  }
fi

if [ "$BUILD_FRONTEND" -eq 1 ]; then
  echo "==> Build frontend"
  $COMPOSE build --progress=plain frontend
elif [ -n "$PREV" ] && [ "$PREV" != "$GIT_COMMIT" ]; then
  retag_image sk-store-prod-frontend || {
    BUILD_FRONTEND=1
    RECREATE_FRONTEND=1
    $COMPOSE build --progress=plain frontend
  }
fi

if [ "$RUN_MIGRATE" -eq 1 ]; then
  echo "==> Prisma migrate deploy"
  $COMPOSE run --rm backend npx prisma migrate deploy
else
  echo "==> Skip migrate (no server/ changes)"
fi

SERVICES=""
[ "$RECREATE_BACKEND" -eq 1 ] && SERVICES="${SERVICES} backend"
[ "$RECREATE_FRONTEND" -eq 1 ] && SERVICES="${SERVICES} frontend"

if [ -n "${SERVICES# }" ]; then
  echo "==> Recreate:${SERVICES}"
  # shellcheck disable=SC2086
  $COMPOSE up -d --force-recreate --no-build --wait ${SERVICES}
else
  echo "==> Skip container recreate"
fi

$COMPOSE ps

if [ "$RECREATE_FRONTEND" -eq 1 ]; then
  RUNNING_COMMIT="$($COMPOSE exec -T frontend node -p 'process.env.GIT_COMMIT||"unknown"' 2>/dev/null | tr -d '\r' || true)"
  echo "==> Expected GIT_COMMIT: ${GIT_COMMIT}"
  echo "==> Running GIT_COMMIT:  ${RUNNING_COMMIT}"
  if [ "${RUNNING_COMMIT}" != "${GIT_COMMIT}" ]; then
    echo "ERROR: Frontend GIT_COMMIT mismatch (expected ${GIT_COMMIT}, got ${RUNNING_COMMIT})" >&2
    exit 1
  fi
  echo "==> Frontend commit verified"
fi

printf '%s\n' "$GIT_COMMIT" > "$DEPLOY_MARKER"
echo "==> Deploy marker updated: ${DEPLOY_MARKER}"
