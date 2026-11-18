#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Please install Node.js LTS first."; exit 1; }
if [ ! -d node_modules ]; then npm install; fi
npm run dev
