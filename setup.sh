#!/usr/bin/env bash
set -euo pipefail

# Bouldering Tracker - First-time setup (macOS)
# Usage:
#   ./setup.sh <SPREADSHEET_ID>
# Example:
#   ./setup.sh 1AbCdEfGhIjKlMnOpQrStUvWxYz

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm not found. Install Node.js first: https://nodejs.org"
  exit 1
fi

if ! command -v clasp >/dev/null 2>&1; then
  echo "📦 Installing clasp..."
  npm i -g @google/clasp
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: ./setup.sh <SPREADSHEET_ID>"
  exit 1
fi

SHEET_ID="$1"
PROJECT_TITLE="Bouldering Tracker"

echo "🔐 Logging into Google (use karolszostekclaw@gmail.com)..."
clasp login --no-localhost

echo "🧩 Creating Apps Script project bound to sheet..."
if [[ -f .clasp.json ]]; then
  echo "ℹ️ .clasp.json already exists. Skipping project creation."
else
  clasp create --type sheets --title "$PROJECT_TITLE" --parentId "$SHEET_ID"
fi

echo "📝 Preparing Apps Script files..."
cp -f bouldering_tracker.gs Code.gs
cp -f bouldering_tracker_views.gs Views.gs

echo "🚀 Pushing script to Google Apps Script..."
clasp push

echo "✅ Setup complete."
echo "Next in Google Sheet:"
echo "1) Reload sheet"
echo "2) Tracker Tools -> Setup / Repair Spreadsheet"
echo "3) If needed: Tracker Tools -> Sync IDs & Dashboards"
echo "4) If needed: Tracker Tools -> Refresh Rankings & New Routes Views"
