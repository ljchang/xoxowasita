# Wasita's Public Dissertation Defense Commentary — Design

**Date:** 2026-07-10
**Requested by:** Luke Chang
**Purpose:** During Wasita's public dissertation defense, audience members scan a QR
code, enter their name (no authentication), and comment/react in real time while she
talks. All data persists so something can be plotted from it on her "thank you" slide.

## Goals

- Zero-friction join: QR code → URL → type a name → chatting (< 10 seconds).
- Feels instant on a phone: optimistic sends, live typing dots, live reactions.
- Everything persisted: messages, authors, timestamps, reactions, threads.
- Looks like *her* app: dark theme built from the shared-reality-chat palette.

## Non-goals

- No authentication, accounts, or moderation tooling (friendly defense audience).
- No pagination/virtualization (a defense produces hundreds of messages, not millions).
- No offline support beyond Firebase SDK defaults.

## Architecture

Single-page app, **Svelte 5 + Vite + Tailwind CSS v4**, deployed to **Firebase
Hosting** on a **new dedicated Firebase project** (owner: lukejchang@gmail.com,
Spark/free tier). "Serverless" as in Wasita's own apps: the browser talks directly
to **Firebase Realtime Database** (RTDB) — no backend.

RTDB over Firestore (her dyadic apps used Firestore) because an audience of
~50–200 phones generates high-frequency ephemeral writes (typing, reactions);
RTDB is built for cheap small writes and fan-out, and `onDisconnect()` gives free
presence cleanup. Persistence is equivalent; the whole event exports as one JSON.

## Data model (RTDB)

```
/messages/{pushId}
    name:      string  (1–30 chars)
    text:      string  (1–500 chars, emoji welcome)
    ts:        number  (firebase.database.ServerValue.TIMESTAMP)
    parentId:  string|null   # null = top-level, else pushId of thread parent

/reactions/{messageId}/{emoji}/{clientId}: name-string
    # one node per reactor; toggle = set/remove; count = number of children

/typing/{scope}/{clientId}: { name, ts }
    # scope = "main" or a parent messageId (typing inside a thread)
    # written true on keystroke, debounced 500 ms to remove; onDisconnect().remove()
```

Client identity: `clientId` = random id persisted in `localStorage` alongside the
chosen display name. Refreshing keeps identity; no re-login.

Threading is Slack-style: replies store `parentId`. The client subscribes to
`/messages` once (child_added) and derives: top-level list, per-parent reply
counts, and thread views. At defense scale this is a few hundred small objects.

## Security rules

- `/messages`: world-readable; writes only create (`!data.exists()`), must match
  shape (name 1–30 chars, text 1–500 chars, ts = now). Append-only: no edits or
  deletes of anyone's messages.
- `/reactions/{msg}/{emoji}/{clientId}`: world-readable; any client may set/remove
  nodes (value = short string). Emoji key length capped.
- `/typing`: world-readable, world-writable (ephemeral).

## UI

**Screens:** (1) Name entry — app title, one input, gradient "join" button.
(2) Chat room — header with title + live participant hint, scrolling message list,
composer pinned to bottom (safe-area aware for iOS). (3) Thread panel — slides in
over the room, shows parent + replies + its own composer.

**Message bubble (Wasita's design language):** own messages right-aligned
`indigo-500`, others left-aligned `fuchsia-400`, white text, `shadow-lg`,
asymmetric rounded corners (tail toward the author side). Author name and
short time beside/above the bubble. Under the bubble: reaction chips
(emoji + count, own-reaction highlighted, tap to toggle) and a
"N replies →" link when the message has a thread.

**Message actions:** a small always-visible affordance on each bubble — an
emoji-react button (opens a compact picker: quick row 💜 😂 👏 🔥 😮 ➕ full
picker) and a "reply in thread" button.

**Composer:** text input + emoji picker button + gradient send button
(violet-500 → fuchsia-500). Enter sends. Native emoji keyboards just work;
the picker is for desktop/quick access.

**Typing indicator:** her bouncing-dots animation + "Sarah is typing…" /
"3 people are typing…", shown above the composer; scoped per thread.

**Responsiveness tricks:** optimistic render of own sends, `child_added`
streaming (no full-list re-reads), auto-scroll pinned to bottom unless the user
has scrolled up (then a "↓ new messages" pill).

**Theme (dark, from her palette):** background near-black violet
(`#0f0a1a`-family), surfaces dark violet-gray, text near-white, accents
violet-500/fuchsia-400/pink-400, gradients violet→fuchsia. Light pink `#f9a8d4`
as decoration only (fails contrast as a mark — known from her GitHub report work).

## Deliverables

1. Deployed app at `https://<project>.web.app` (Firebase Hosting).
2. Slide-ready QR code (PNG + SVG) pointing at the URL, styled in her palette.
3. Export path documented: one command / URL to pull the full event JSON for the
   thank-you-slide plot.
4. Source in `defense-chat/` git repo with README.

## Error handling

- RTDB connection state surfaced subtly ("reconnecting…" toast) via
  `.info/connected`.
- Sends that fail retry via SDK; optimistic bubble marked pending until ack.
- Empty/whitespace messages rejected client-side; length capped at 500 chars.
- Rules reject malformed writes server-side.

## Testing

- Local dev against the RTDB emulator or the live dev DB; Playwright smoke test:
  two browser contexts — join, send, see each other's message, react, reply in
  thread, typing dots appear.
- Manual phone check on the deployed URL before the defense.
