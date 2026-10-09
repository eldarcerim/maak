#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm test
python3 /data/platform/backend/scripts/validate-app.py "$PWD"
