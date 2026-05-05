#!/usr/bin/env bash
set -euo pipefail

# Bouldering Tracker - Update/push script (macOS)
# Usage:
#   ./update.sh

if ! command -v clasp >/dev/null 2>&1; then
  echo "❌ clasp not found. Run ./setup.sh first."
  exit 1
fi

if [[ ! -f .clasp.json ]]; then
  echo "❌ .clasp.json not found. Run ./setup.sh <SPREADSHEET_ID> first."
  exit 1
fi

echo "🔍 Quick syntax checks..."
cp -f bouldering_tracker.gs /tmp/bouldering_tracker.js
cp -f bouldering_tracker_views.gs /tmp/bouldering_tracker_views.js
node --check /tmp/bouldering_tracker.js
node --check /tmp/bouldering_tracker_views.js

echo "📝 Preparing Apps Script files..."
cp -f bouldering_tracker.gs Code.gs
cp -f bouldering_tracker_views.gs Views.gs

echo "🚀 Pushing update..."
clasp push

echo "✅ Update pushed."
echo "Recommended in sheet:"
echo "- Run Tracker Tools -> Run Post-Update Routine (one click)"
