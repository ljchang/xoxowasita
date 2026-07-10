# Wasita's Public Dissertation Defense Commentary

Real-time audience chat for Wasita's public dissertation defense. The audience
scans a QR code, types a name (no account), and comments / emoji-reacts /
threads while she talks. Everything persists so the reactions can be plotted
on her "thank you" slide.

**Live:** https://wasita-defense-chat.web.app
**QR (slide-ready):** `qr/defense-chat-qr.png` / `.svg`

Built in the style of Wasita's own chat apps (cosanlab/shared-reality-chat):
Svelte 5 + Vite + Tailwind v4, serverless — the browser talks straight to
Firebase Realtime Database. Dark theme in her violet/fuchsia/pink palette;
bubbles, gradients, and the 500 ms typing-debounce are borrowed from her code.

## Features

- Name-only join (identity kept in `localStorage`; refresh doesn't re-prompt)
- Slack-style threads (reply counts on parents, slide-over thread panel)
- Emoji reactions on any message (tap chip to toggle; picker of 16 quick emoji)
- "‹name› is typing…" dots, per room *and* per thread, aggregated ("3 people…")
- Optimistic sends, pinned autoscroll with "↓ new messages" pill,
  reconnecting indicator, iOS safe-area aware composer

## Firebase

- Project: `wasita-defense-chat` (owner lukejchang@gmail.com, Spark plan)
- RTDB: `https://wasita-defense-chat-default-rtdb.firebaseio.com`
- Rules (`database.rules.json`): world-readable; `/messages` append-only with
  shape validation (name ≤ 30, text ≤ 500, no extra fields — so no edits or
  deletes from clients); reactions keyed per client; `/typing` ephemeral with
  `onDisconnect` cleanup.
- Web SDK config in `.env.local` (not secret — security is in the rules;
  `.env.example` lists the keys, values come from
  `npx firebase apps:sdkconfig web`).

## Data model

```
/messages/{pushId}:  { name, text, ts, parentId? }   # parentId ⇒ thread reply
/reactions/{msgId}/{emoji}/{clientId}: name
/typing/{scope}/{clientId}: { name, ts }             # scope = "main" | msgId
```

## Develop / test / deploy

```bash
npm install
npm run dev          # local dev against the live database
npm test             # Vitest unit tests (identity, derivations)
npm run e2e          # Playwright 2-user smoke test (live DB, unique strings)
BASE_URL=https://wasita-defense-chat.web.app npm run e2e   # against prod

npm run build && npx firebase deploy   # hosting + database rules
```

## Event-day runbook

1. **Before the talk:** `./scripts/reset_chat.sh` to wipe test chatter
   (export first if you want it: `./scripts/export_chat.sh`).
2. Put `qr/defense-chat-qr.png` on the intro slide, tell people to scan.
3. **After:** `./scripts/export_chat.sh` → one JSON with every message,
   author, timestamp (ms epoch), thread parent, and reaction — ready for the
   thank-you-slide plot. Both scripts authenticate via your `gcloud` login.

Design + plan docs: `docs/superpowers/`.
