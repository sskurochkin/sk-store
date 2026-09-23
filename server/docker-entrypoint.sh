#!/bin/sh
set -e

mkdir -p /app/public/media
chown -R nestjs:nestjs /app/public/media

exec runuser -u nestjs -- "$@"
