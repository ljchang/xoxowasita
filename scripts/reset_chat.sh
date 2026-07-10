#!/usr/bin/env bash
# DANGER: wipes all messages, reactions, and typing state.
# Run once right before the defense to clear test chatter.
# Prompts for confirmation; export first if you want to keep anything.
set -euo pipefail

DB="https://wasita-defense-chat-default-rtdb.firebaseio.com"

read -r -p "Really delete ALL chat data from $DB? [y/N] " ans
[[ "$ans" == "y" || "$ans" == "Y" ]] || { echo "aborted"; exit 1; }

TOKEN=$(gcloud auth print-access-token)
for path in messages reactions typing; do
  curl -sf -X DELETE "$DB/$path.json?access_token=$TOKEN" > /dev/null
  echo "cleared /$path"
done
