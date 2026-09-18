#!/bin/sh
# Deploys to $TARGET_ENV (required), default port 8080.
env="$TARGET_ENV"
port="${PORT:-8080}"
echo "deploying to $env:$port"
