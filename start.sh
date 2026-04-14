#!/bin/bash
set -e

cd "$(dirname "$0")/site"

echo "Starting CMS server on port 8000..."
deno run -A _cms_server.ts &
CMS_PID=$!

sleep 2

echo "Starting Lume dev server on port 3001..."
deno task dev &
LUME_PID=$!

cd ../builder-admin

echo "Starting Builder Admin on port 3000..."
npm run dev &
BUILDER_PID=$!

echo ""
echo "=========================================="
echo "  Site Builder is running!"
echo "=========================================="
echo "  Builder Admin: http://localhost:3000"
echo "  Site Preview:  http://localhost:3001"
echo "  CMS API:       http://localhost:8000"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo "=========================================="

trap "kill $CMS_PID $LUME_PID $BUILDER_PID 2>/dev/null" EXIT

wait
