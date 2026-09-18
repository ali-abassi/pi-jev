#!/bin/sh
cd "$(dirname "$0")" || exit 1
fail=0
out=$(./scripts/deploy.sh 2>&1); code=$?
[ "$code" = 2 ] || { echo "missing env must exit 2 (got $code)"; fail=1; }
out=$(TARGET_ENV=qa ./scripts/deploy.sh 2>&1); code=$?
[ "$code" = 0 ] && [ "$out" = "deploying to qa:8080" ] || { echo "qa deploy wrong: [$out] $code"; fail=1; }
out=$(TARGET_ENV=prod PORT=9090 ./scripts/deploy.sh 2>&1)
[ "$out" = "deploying to prod:9090" ] || { echo "prod deploy wrong: [$out]"; fail=1; }
exit $fail
