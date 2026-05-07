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
  echo "Usage: ./setup.sh <SPREADSHEET_ID or SHEET_URL>"
  exit 1
fi

INPUT_SHEET_REF="$1"
PROJECT_TITLE="Bouldering Tracker"

# Accept either Spreadsheet ID or full Google Sheets URL
if [[ "$INPUT_SHEET_REF" == *"docs.google.com/spreadsheets/d/"* ]]; then
  SHEET_ID="$(echo "$INPUT_SHEET_REF" | sed -E 's#.*\/d\/([^\/]+).*#\1#')"
else
  SHEET_ID="$INPUT_SHEET_REF"
fi

if [[ ! "$SHEET_ID" =~ ^[A-Za-z0-9_-]{20,}$ ]]; then
  echo "❌ Invalid spreadsheet reference. Pass a Spreadsheet ID or full Sheet URL."
  exit 1
fi

echo "🔐 Logging into Google (use karolszostekclaw@gmail.com)..."
clasp login --no-localhost

echo "🧩 Binding Apps Script project to target sheet..."
if [[ -f .clasp.json ]]; then
  echo "ℹ️ .clasp.json already exists. Skipping project creation."
  echo "   If this points to the wrong script, delete .clasp.json and rerun setup."
else
  echo "Target sheet ID: $SHEET_ID"
  clasp create --type sheets --title "$PROJECT_TITLE" --parentId "$SHEET_ID"
  if [[ ! -f .clasp.json ]]; then
    echo "❌ clasp create did not produce .clasp.json. Aborting to avoid accidental extra creates."
    exit 1
  fi
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
