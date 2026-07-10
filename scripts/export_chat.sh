#!/usr/bin/env bash
# Export the entire event (messages, reactions) as one JSON file.
# Auth: your gcloud login (project owner) — bypasses the read rules cleanly.
# Usage: ./scripts/export_chat.sh [outfile]
set -euo pipefail

DB="https://wasita-defense-chat-default-rtdb.firebaseio.com"
OUT="${1:-defense-chat-export-$(date +%Y%m%d-%H%M%S).json}"

curl -sf "$DB/.json?access_token=$(gcloud auth print-access-token)&print=pretty" > "$OUT"
echo "Wrote $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
